import type { EffectType } from "../../../types/effects";
import { EffectCategory, EffectTrigger } from "../../../shared/effect-constants";
import { CustomVariableManager } from "../../common/custom-variable-manager";
import logger from "../../logwrapper";

const model: EffectType<{
    text: string;
    targetLang: string;
    message: string;
    chatter: string;
    whisper: string;
    sendAsReply: boolean;
    customVarName: string;
    customVarTtl: number;
}> = {
    definition: {
        id: "firebot:get-translation-deepl",
        name: "DeepL で翻訳する",
        description: "DeepL API を使ってテキストを翻訳します（設定 → 連携 → JP Original 外部API設定 で API キーを設定してください）",
        icon: "fad fa-language",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "翻訳結果",
                defaultName: "deeplTranslation",
                description: "DeepL による翻訳後テキスト"
            },
            {
                label: "検出された言語",
                defaultName: "deeplSourceLang",
                description: "元テキストの自動検出された言語コード"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="翻訳するテキスト" pad-top="true">
            <textarea ng-model="effect.text" class="form-control" rows="4"
                placeholder="翻訳したいテキストを入力" replace-variables></textarea>
        </eos-container>

        <eos-container header="翻訳先言語" pad-top="true">
            <dropdown-select options="langOptions" selected="effect.targetLang"></dropdown-select>
        </eos-container>

        <eos-container header="チャット送信 （任意）" pad-top="true">
            <p class="muted" style="font-size:11px;"><b>翻訳結果:</b> {translatedText}</p>
            <textarea ng-model="effect.message" class="form-control" rows="3"
                placeholder="送信しない場合は空欄。{translatedText} で翻訳結果を挿入できます。"
                replace-variables></textarea>
            <div ng-show="effect.message" style="margin-top:10px;">
                <eos-chatter-select effect="effect" title="送信アカウント"></eos-chatter-select>
                <div style="display:flex; flex-direction:row; width:100%; height:36px; margin:10px 0; align-items:center;">
                    <label class="control-fb control--checkbox" style="margin:0 15px 0 0;">ささやく
                        <input type="checkbox"
                            ng-init="whisper = (effect.whisper != null && effect.whisper !== '')"
                            ng-model="whisper"
                            ng-click="effect.whisper = ''">
                        <div class="control__indicator"></div>
                    </label>
                    <div ng-show="whisper">
                        <div class="input-group">
                            <span class="input-group-addon">宛先</span>
                            <input ng-model="effect.whisper" type="text" class="form-control"
                                placeholder="Username" replace-variables>
                        </div>
                    </div>
                </div>
                <div ng-hide="whisper">
                    <label class="control-fb control--checkbox" style="margin:0 15px 0 0;">返信として送る
                        <tooltip text="'返信はコマンドまたはチャットメッセージイベント内でのみ機能します。'"></tooltip>
                        <input type="checkbox" ng-model="effect.sendAsReply">
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
        </eos-container>

        <eos-container header="カスタム変数に保存 （任意）" pad-top="true">
            <p class="muted" style="font-size:11px;">翻訳結果を <code>$customVariable[名前]</code> で参照できるカスタム変数に保存します。</p>
            <div class="form-group" style="display:flex; gap:16px; align-items:flex-end;">
                <div style="flex:1;">
                    <label class="control-label">変数名 <span class="muted">（空欄でスキップ）</span></label>
                    <input type="text" class="form-control" ng-model="effect.customVarName"
                        placeholder="translationResult" replace-variables />
                </div>
                <div style="width:140px;">
                    <label class="control-label">有効期限（秒）</label>
                    <input type="number" class="form-control" ng-model="effect.customVarTtl"
                        placeholder="0" min="0" />
                    <p class="help-block muted" style="font-size:10px;">0 = 無期限</p>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.targetLang == null) {
            $scope.effect.targetLang = "JA";
        }
        if ($scope.effect.customVarTtl == null) {
            $scope.effect.customVarTtl = 0;
        }

        $scope.langOptions = {
            JA: "日本語",
            EN: "英語",
            "ZH-HANS": "中国語（簡体字）",
            "ZH-HANT": "中国語（繁体字）",
            KO: "韓国語",
            FR: "フランス語",
            DE: "ドイツ語",
            ES: "スペイン語",
            PT: "ポルトガル語",
            IT: "イタリア語",
            RU: "ロシア語",
            NL: "オランダ語",
            PL: "ポーランド語"
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.text) {
            errors.push("翻訳するテキストを入力してください");
        }
        if (!effect.targetLang) {
            errors.push("翻訳先言語を選択してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        const integrationManager = require("../../integrations/integration-manager");
        const twitchChat = require("../../chat/twitch-chat");
        const chatHelpers = require("../../chat/chat-helpers");
        const commandHandler = require("../../chat/commands/commandHandler");

        const intDef = integrationManager.getIntegrationDefinitionById("jp-original-api");
        const apiKey: string | undefined = intDef?.userSettings?.deepl?.apiKey;
        const isPro: boolean = intDef?.userSettings?.deepl?.isPro ?? false;

        if (!apiKey) {
            logger.warn("DeepL API キーが設定されていません。設定 → 連携 → JP Original 外部API設定 で設定してください。");
            return false;
        }

        try {
            const endpoint = isPro
                ? "https://api.deepl.com/v2/translate"
                : "https://api-free.deepl.com/v2/translate";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `DeepL-Auth-Key ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: [effect.text],
                    target_lang: effect.targetLang
                })
            });

            if (!response.ok) {
                logger.error(`DeepL リクエスト失敗: ${response.status} ${response.statusText}`);
                return false;
            }

            const data: {
                translations: Array<{
                    detected_source_language: string;
                    text: string;
                }>;
            } = await response.json();

            const translatedText = data.translations[0]?.text ?? "";
            const sourceLang = data.translations[0]?.detected_source_language ?? "";

            if (effect.message) {
                const chatMessage = effect.message.replace("{translatedText}", translatedText);

                let messageId: string | null = null;
                if (trigger.type === EffectTrigger.COMMAND) {
                    messageId = trigger.metadata.chatMessage?.id ?? null;
                } else if (trigger.type === EffectTrigger.EVENT) {
                    messageId = trigger.metadata.eventData?.chatMessage?.id ?? null;
                }

                await twitchChat.sendChatMessage(
                    chatMessage,
                    effect.whisper,
                    effect.chatter,
                    !effect.whisper && effect.sendAsReply ? messageId : undefined
                );

                if (effect.chatter === "Streamer" && (effect.whisper == null || !effect.whisper.length)) {
                    const firebotMessage = await chatHelpers.buildStreamerFirebotChatMessageFromText(chatMessage);
                    commandHandler.handleChatMessage(firebotMessage);
                }
            }

            if (effect.customVarName) {
                CustomVariableManager.addCustomVariable(effect.customVarName, translatedText, effect.customVarTtl ?? 0);
            }

            return {
                success: true,
                outputs: {
                    deeplTranslation: translatedText,
                    deeplSourceLang: sourceLang
                }
            };
        } catch (error) {
            logger.error("DeepL エラー", (error as Error).message);
            return false;
        }
    }
};

export = model;
