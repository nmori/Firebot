import type { EffectType } from "../../../types/effects";
import { EffectCategory, EffectTrigger } from "../../../shared/effect-constants";
import { CustomVariableManager } from "../../common/custom-variable-manager";
import logger from "../../logwrapper";
import { SecretsManager } from "../../secrets-manager";

type TranslationApiResponse = {
    translation?: string;
    from?: string;
    sourceLang?: string;
    detectedSourceLanguage?: string;
    error?: string;
    message?: string;
};

const model: EffectType<{
    text: string;
    fromLang: string;
    targetLang: string;
    message: string;
    chatter: string;
    whisper: string;
    sendAsReply: boolean;
    customVarName: string;
    customVarTtl: number;
}> = {
    definition: {
        id: "firebot:get-translation-free",
        name: "翻訳 API で翻訳する",
        description: "ローカライズ版で提供される翻訳 API を使ってテキストを翻訳します",
        icon: "fad fa-language",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "翻訳結果",
                defaultName: "freeTranslation",
                description: "翻訳後テキスト"
            },
            {
                label: "検出された言語",
                defaultName: "freeSourceLang",
                description: "元言語コード"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="翻訳するテキスト" pad-top="true">
            <textarea ng-model="effect.text" class="form-control" rows="4"
                placeholder="翻訳したいテキストを入力" replace-variables></textarea>
        </eos-container>

        <eos-container header="翻訳元言語" pad-top="true">
            <dropdown-select options="fromLangOptions" selected="effect.fromLang"></dropdown-select>
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
        if ($scope.effect.fromLang == null) {
            $scope.effect.fromLang = "";
        }
        if ($scope.effect.targetLang == null) {
            $scope.effect.targetLang = "ja";
        }
        if ($scope.effect.customVarTtl == null) {
            $scope.effect.customVarTtl = 0;
        }

        $scope.fromLangOptions = {
            "": "自動検出",
            ja: "日本語",
            en: "英語",
            "zh-CN": "中国語（簡体字）",
            "zh-TW": "中国語（繁体字）",
            ko: "韓国語",
            fr: "フランス語",
            de: "ドイツ語",
            es: "スペイン語"
        };

        $scope.langOptions = {
            ja: "日本語",
            en: "英語",
            "zh-CN": "中国語（簡体字）",
            "zh-TW": "中国語（繁体字）",
            ko: "韓国語",
            fr: "フランス語",
            de: "ドイツ語",
            es: "スペイン語"
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
        const twitchChat = require("../../chat/twitch-chat");
        const chatHelpers = require("../../chat/chat-helpers");
        const commandHandler = require("../../chat/commands/chat-command-handler");

        const baseEndpoint = SecretsManager.secrets?.translationApiEndpoint?.trim();
        if (!baseEndpoint) {
            logger.warn("translationApiEndpoint が secrets.json に設定されていません。");
            return false;
        }

        const endpoint = `${baseEndpoint.replace(/\/+$/, "")}`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    input: effect.text,
                    to: effect.targetLang,
                    from: effect.fromLang ?? ""
                })
            });

            const data = await response.json() as TranslationApiResponse;

            if (!response.ok) {
                logger.error(`Free 翻訳 API リクエスト失敗: ${response.status} ${data.error ?? data.message ?? response.statusText}`);
                return false;
            }

            const translatedText = data.translation?.trim() ?? "";
            const sourceLang = data.from ?? data.sourceLang ?? data.detectedSourceLanguage ?? "";

            if (!translatedText) {
                logger.error("Free 翻訳 API から translation が返されませんでした。");
                return false;
            }

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
                    freeTranslation: translatedText,
                    freeSourceLang: sourceLang
                }
            };
        } catch (error) {
            logger.error("Free 翻訳 API エラー", (error as Error).message);
            return false;
        }
    }
};

export = model;
