import fs from "fs-extra";
import tmp from "tmp";
import type { EffectType } from "../../../../types/effects";
import type { FirebotAudioDevice } from "../../../../types/settings";
import { EffectCategory } from "../../../../shared/effect-constants";
import { SettingsManager } from "../../../common/settings-manager";
import { ResourceTokenManager } from "../../../resource-token-manager";
import webServer from "../../../../server/http-server-manager";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";
import { wait } from "../../../utils";

// VOICEVOX ENGINE 互換 API（/speakers, /audio_query, /synthesis）を持つエンジン向けの共通実装。
// VOICEVOX / VOICEVOX Nemo / SHAREVOX / ITVoice / LMROID / COEIROINK v1 が利用する。

type VoiceCast = {
    name: string;
    id: number;
};

type AdjustmentKey =
    | "speedScale"
    | "pitchScale"
    | "intonationScale"
    | "volumeScale"
    | "pauseLengthScale"
    | "prePhonemeLength"
    | "postPhonemeLength";

type SpeakersResponse = Array<{
    name: string;
    styles: Array<{ name: string, id: number, type?: string }>;
}>;

type VoicevoxAdjustment = Partial<Record<AdjustmentKey, number>>;

type VoicevoxCompatibleEffectModel = {
    message: string;
    voicecast: VoiceCast;
    voicelists: VoiceCast[];
    voicevoxPort: number;
    volume: number;
    waitForSound: boolean;
    overlayInstance: string;
    audioOutputDevice: FirebotAudioDevice;
    useAdjustment?: boolean;
    adjustment?: VoicevoxAdjustment;
};

type AdjustmentParam = {
    key: AdjustmentKey;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    /** audio_query の結果にこの項目が無いエンジン（古い版や派生エンジン）では送らない */
    optional?: boolean;
};

// 範囲は VOICEVOX エディタの調整スライダーに合わせている。
// ENGINE 0.26 以降は speedScale > 0 / 音量・無音時間 >= 0 を満たさないと 422 になるため、送信前にもこの範囲へ丸める。
const ADJUSTMENT_PARAMS: AdjustmentParam[] = [
    { key: "speedScale", label: "話速", min: 0.5, max: 2, step: 0.01, defaultValue: 1 },
    { key: "pitchScale", label: "音高", min: -0.15, max: 0.15, step: 0.01, defaultValue: 0 },
    { key: "intonationScale", label: "抑揚", min: 0, max: 2, step: 0.01, defaultValue: 1 },
    { key: "volumeScale", label: "音量（合成時）", min: 0, max: 2, step: 0.01, defaultValue: 1 },
    { key: "pauseLengthScale", label: "間の長さ", min: 0, max: 2, step: 0.01, defaultValue: 1, optional: true },
    { key: "prePhonemeLength", label: "開始無音（秒）", min: 0, max: 1.5, step: 0.01, defaultValue: 0.1 },
    { key: "postPhonemeLength", label: "終了無音（秒）", min: 0, max: 1.5, step: 0.01, defaultValue: 0.1 }
];

const buildAdjustmentTemplate = () => ADJUSTMENT_PARAMS.map((p) => {
    const model = `effect.adjustment.${p.key}`;
    return `
                <div class="form-group" ng-init="${model} = ${model} != null ? ${model} : ${p.defaultValue}">
                    <label class="control-label">${p.label} <span class="muted" style="font-size:11px;">（${p.min}〜${p.max}、標準 ${p.defaultValue}）</span></label>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="flex:1;">
                            <rzslider rz-slider-model="${model}" rz-slider-options="{floor: ${p.min}, ceil: ${p.max}, step: ${p.step}, precision: 2, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                        </div>
                        <input type="number" class="form-control" ng-model="${model}" step="${p.step}" style="width:100px;" />
                    </div>
                </div>`;
}).join("");

const resolveAdjustmentValue = (param: AdjustmentParam, value: unknown): number => {
    const num = Number(value);
    if (value == null || value === "" || !Number.isFinite(num)) {
        return param.defaultValue;
    }
    return Math.min(param.max, Math.max(param.min, num));
};

const applyAdjustment = (query: Record<string, unknown>, adjustment: VoicevoxAdjustment | undefined) => {
    for (const param of ADJUSTMENT_PARAMS) {
        if (param.optional && !(param.key in query)) {
            continue;
        }
        query[param.key] = resolveAdjustmentValue(param, adjustment?.[param.key]);
    }
};

const readErrorDetail = async (res: Response) => {
    try {
        return await res.text();
    } catch {
        return "";
    }
};

export function createVoicevoxCompatibleEffect(options: {
    id: string;
    engineName: string;
    defaultPort: number;
}): EffectType<VoicevoxCompatibleEffectModel> {
    const { id, engineName, defaultPort } = options;

    return {
        definition: {
            id,
            name: `${engineName}で読み上げ`,
            description: `${engineName}を使って音声読み上げを行います`,
            icon: "fad fa-waveform",
            categories: [EffectCategory.JP_ORIGINAL],
            dependencies: []
        },
        // optionsController はフロント側へ文字列で渡されるためクロージャの値を参照できない。
        // エンジンごとの既定ポートはテンプレート側の ng-init で設定する。
        optionsTemplate: `
        <div ng-init="effect.voicevoxPort = effect.voicevoxPort || ${defaultPort}"></div>

        <eos-container header="キャスト">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="voicecast-name">{{effect.voicecast ? effect.voicecast.name : '選択...'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu voicecast-name-dropdown">
                    <li ng-repeat="voicelist in effect.voicelists"
                        ng-click="effect.voicecast = voicelist">
                        <a href>{{voicelist.name}}</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="音声" pad-top="true">
            <div style="padding-top:20px">
                <label class="control-fb control--checkbox"> 音声終了まで待機する <tooltip text="'音声が終わるまで待機します。次の処理に移るまで待機したい場合に有効にしてください。'"></tooltip>
                    <input type="checkbox" ng-model="effect.waitForSound">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="音声調整" pad-top="true">
            <label class="control-fb control--checkbox"> 音声を調整する <tooltip text="'有効にすると、話速・音高・抑揚などを指定した値で合成します。無効の場合はエンジンの標準値で合成します。'"></tooltip>
                <input type="checkbox" ng-model="effect.useAdjustment">
                <div class="control__indicator"></div>
            </label>
            <div ng-init="effect.adjustment = effect.adjustment || {}"></div>
            <div ng-if="effect.useAdjustment" style="padding-top:10px;">${buildAdjustmentTemplate()}
            </div>
        </eos-container>

        <eos-container header="音量" pad-top="true">
            <div class="volume-slider-wrapper">
                <i class="fal fa-volume-down volume-low"></i>
                <rzslider rz-slider-model="effect.volume" rz-slider-options="{floor: 1, ceil: 10, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                <i class="fal fa-volume-up volume-high"></i>
            </div>
        </eos-container>

        <eos-audio-output-device effect="effect" pad-top="true"></eos-audio-output-device>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
    `,
        // logger はフロント側の Angular サービスを注入して使う（バックエンドの logwrapper はフロントで参照できない）
        optionsController: ($scope, logger: { error: (...args: unknown[]) => void }) => {
            if ($scope.effect.volume == null) {
                $scope.effect.volume = 5;
            }

            $scope.effect.voicelists = [];

            const loadSpeakers = async (port: number) => {
                try {
                    const response = await fetch(`http://127.0.0.1:${port}/speakers`, { method: "GET" });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const responseData = await response.json() as SpeakersResponse;

                    const voicelists: VoiceCast[] = [];
                    for (const voicecast of responseData) {
                        for (const voicestyle of voicecast.styles) {
                            // type は ENGINE 0.14 以降のみ存在し、0.26 で streaming_talk が追加された。
                            // 歌唱専用スタイル（sing / singing_teacher / frame_decode）は読み上げに使えないため除外する。
                            if (voicestyle.type != null && voicestyle.type !== "talk" && voicestyle.type !== "streaming_talk") {
                                continue;
                            }
                            voicelists.push({ name: `${voicecast.name}-${voicestyle.name}`, id: voicestyle.id });
                        }
                    }
                    $scope.effect.voicelists = voicelists;
                    $scope.$applyAsync();
                } catch (error) {
                    logger.error("Error running http request", (error as Error).message);
                }
            };

            // 既定ポートはテンプレートの ng-init で入るので、値が確定してから一覧を取得する
            $scope.$watch("effect.voicevoxPort", (port: number) => {
                if (port != null) {
                    void loadSpeakers(port);
                }
            });
        },
        optionsValidator: (effect) => {
            const errors: string[] = [];
            if (effect.voicecast == null) {
                errors.push("キャストを選択してください");
            }
            return errors;
        },
        onTriggerEvent: async (event) => {
            const effect = event.effect;
            const port = effect.voicevoxPort ?? defaultPort;
            const tmpWaveFile = tmp.fileSync({ postfix: ".wav" });

            try {
                const queryRes = await fetch(
                    `http://127.0.0.1:${port}/audio_query?text=${encodeURIComponent(effect.message)}&speaker=${effect.voicecast.id}`,
                    { headers: { "Content-Type": "application/json" }, method: "POST" }
                );
                if (!queryRes.ok) {
                    logger.error(`${engineName}: audio_query failed (HTTP ${queryRes.status})`, await readErrorDetail(queryRes));
                    tmpWaveFile.removeCallback();
                    return true;
                }
                const query = await queryRes.json() as Record<string, unknown>;

                if (effect.useAdjustment === true) {
                    applyAdjustment(query, effect.adjustment);
                }

                const synthRes = await fetch(
                    `http://127.0.0.1:${port}/synthesis?speaker=${effect.voicecast.id}&enable_interrogative_upspeak=true`,
                    {
                        headers: { "Content-Type": "application/json", accept: "audio/wav" },
                        method: "POST",
                        body: JSON.stringify(query)
                    }
                );
                if (!synthRes.ok) {
                    // ENGINE 0.26 以降は不正な入力やスタイルを 4xx で返す
                    logger.error(`${engineName}: synthesis failed (HTTP ${synthRes.status})`, await readErrorDetail(synthRes));
                    tmpWaveFile.removeCallback();
                    return true;
                }
                const buffer = Buffer.from(await synthRes.arrayBuffer());
                try {
                    fs.writeFileSync(tmpWaveFile.name, buffer, "binary");
                } catch (err) {
                    logger.error("Error writing to temporary file:", (err as Error).message);
                }
            } catch (error) {
                logger.error("Error running http request", (error as Error).message);
                tmpWaveFile.removeCallback();
                return true;
            }

            const data: {
                filepath: string;
                url: string;
                isUrl: boolean;
                volume: number;
                overlayInstance: string;
                resourceToken?: string;
                audioOutputDevice?: FirebotAudioDevice;
            } = {
                filepath: tmpWaveFile.name,
                url: "",
                isUrl: false,
                volume: effect.volume,
                overlayInstance: effect.overlayInstance
            };

            let selectedOutputDevice = effect.audioOutputDevice;
            if (selectedOutputDevice == null || selectedOutputDevice.deviceId === "") {
                selectedOutputDevice = SettingsManager.getSetting("AudioOutputDevice");
            }
            data.audioOutputDevice = selectedOutputDevice;

            if (selectedOutputDevice.deviceId === "overlay") {
                const resourceToken = ResourceTokenManager.storeResourcePath(data.filepath, 30);
                data.resourceToken = resourceToken;
                webServer.sendToOverlay("sound", data);
            } else {
                frontendCommunicator.send("playsound", data);
            }

            if (effect.waitForSound) {
                try {
                    const duration = await frontendCommunicator.fireEventAsync<number>("getSoundDuration", {
                        path: data.filepath
                    });
                    const durationInMils = (Math.round(duration) || 0) * 1000;
                    await wait(durationInMils);
                    tmpWaveFile.removeCallback();
                } catch {
                    // ignore
                }
            } else {
                try {
                    const duration = await frontendCommunicator.fireEventAsync<number>("getSoundDuration", {
                        path: data.filepath
                    });
                    const durationInMils = (Math.round(duration) || 0) * 1000;
                    setTimeout(() => tmpWaveFile.removeCallback(), durationInMils + 10000);
                } catch {
                    // ignore
                }
            }

            return true;
        }
    };
}
