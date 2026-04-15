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
        id: "firebot:get-translation-ms",
        name: "Microsoft 翻訳する",
        description: "Azure Cognitive Services Translator を使ってテキストを翻訳します（設定 → 連携 → JP Original 外部API設定 で API キーを設定してください）",
        icon: "fad fa-language",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "翻訳結果",
                defaultName: "msTranslation",
                description: "Microsoft 翻訳による翻訳後テキスト"
            },
            {
                label: "検出された言語",
                defaultName: "msSourceLang",
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
            $scope.effect.targetLang = "ja";
        }
        if ($scope.effect.customVarTtl == null) {
            $scope.effect.customVarTtl = 0;
        }

        $scope.langOptions = {
            ja: "日本語",
            en: "英語",
            "zh-Hans": "中国語（簡体字）",
            "zh-Hant": "中国語（繁体字）",
            ko: "韓国語",
            fr: "フランス語",
            de: "ドイツ語",
            es: "スペイン語",
            pt: "ポルトガル語",
            it: "イタリア語",
            ru: "ロシア語",
            nl: "オランダ語",
            pl: "ポーランド語",
            ar: "アラビア語",
            th: "タイ語",
            vi: "ベトナム語",
            id: "インドネシア語"
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
        const subscriptionKey: string | undefined = intDef?.userSettings?.microsoftTranslator?.subscriptionKey;
        const region: string = intDef?.userSettings?.microsoftTranslator?.region ?? "global";

        if (!subscriptionKey) {
            logger.warn("Microsoft Translator サブスクリプションキーが設定されていません。設定 → 連携 → JP Original 外部API設定 で設定してください。");
            return false;
        }

        try {
            const response = await fetch(
                `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(effect.targetLang)}`,
                {
                    method: "POST",
                    headers: {
                        "Ocp-Apim-Subscription-Key": subscriptionKey,
                        "Ocp-Apim-Subscription-Region": region,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify([{ text: effect.text }])
                }
            );

            if (!response.ok) {
                logger.error(`Microsoft Translator リクエスト失敗: ${response.status} ${response.statusText}`);
                return false;
            }

            const data: Array<{
                translations: Array<{ text: string, to: string }>;
                detectedLanguage?: { language: string, score: number };
            }> = await response.json();

            const translatedText = data[0]?.translations[0]?.text ?? "";
            const sourceLang = data[0]?.detectedLanguage?.language ?? "";

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
                    msTranslation: translatedText,
                    msSourceLang: sourceLang
                }
            };
        } catch (error) {
            logger.error("Microsoft Translator エラー", (error as Error).message);
            return false;
        }
    }
};

export = model;
