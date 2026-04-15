import fs from "fs-extra";
import tmp from "tmp";
import type { EffectType } from "../../../types/effects";
import type { FirebotAudioDevice } from "../../../types/settings";
import { EffectCategory } from "../../../shared/effect-constants";
import { SettingsManager } from "../../common/settings-manager";
import { ResourceTokenManager } from "../../resource-token-manager";
import webServer from "../../../server/http-server-manager";
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";
import { wait } from "../../utils";

type VoiceCast = {
    name: string;
    id: number;
    uuid: string;
};

const model: EffectType<{
    message: string;
    voicecast: VoiceCast;
    voicelists: VoiceCast[];
    voicevoxPort: number;
    volume: number;
    waitForSound: boolean;
    overlayInstance: string;
    audioOutputDevice: FirebotAudioDevice;
}> = {
    definition: {
        id: "firebot:play-coeiroink-v2",
        name: "COEIROINK v2で読み上げ",
        description: "COEIROINK v2を使って音声読み上げを行います",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
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
    optionsController: async ($scope) => {
        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
        if ($scope.effect.voicevoxPort == null) {
            $scope.effect.voicevoxPort = 50032;
        }

        $scope.effect.voicelists = [];

        try {
            const response = await fetch(
                `http://127.0.0.1:${$scope.effect.voicevoxPort}/v1/speakers`,
                { method: "GET" }
            );
            const responseData: Array<{
                speakerName: string;
                speakerUuid: string;
                styles: Array<{ styleName: string; styleId: number }>;
            }> = JSON.parse(await response.text());

            for (const voicecast of responseData) {
                for (const voicestyle of voicecast.styles) {
                    $scope.effect.voicelists.push({
                        name: `${voicecast.speakerName}-${voicestyle.styleName}`,
                        id: voicestyle.styleId,
                        uuid: voicecast.speakerUuid
                    });
                }
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }
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
        const tmpWaveFile = tmp.fileSync({ postfix: ".wav" });

        try {
            const param = {
                speakerUuid: effect.voicecast.uuid,
                styleId: effect.voicecast.id,
                text: effect.message,
                speedScale: 1,
                volumeScale: 1,
                pitchScale: 0,
                intonationScale: 1,
                prePhonemeLength: 0.1,
                postPhonemeLength: 0.1,
                outputSamplingRate: 44100
            };

            const synthRes = await fetch(
                `http://127.0.0.1:${effect.voicevoxPort}/v1/synthesis`,
                {
                    headers: { "Content-Type": "application/json", accept: "audio/wav" },
                    method: "POST",
                    body: JSON.stringify(param)
                }
            );
            const buffer = Buffer.from(await synthRes.arrayBuffer());
            try {
                fs.writeFileSync(tmpWaveFile.name, buffer, "binary");
            } catch (err) {
                logger.error("Error writing to temporary file:", (err as Error).message);
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
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

export = model;
