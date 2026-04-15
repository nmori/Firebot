import type { EffectType } from "../../../types/effects";
import { EffectCategory, EffectTrigger } from "../../../shared/effect-constants";
import { CustomVariableManager } from "../../common/custom-variable-manager";
import logger from "../../logwrapper";

const model: EffectType<{
    host: string;
    port: number;
    modelName: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
    message: string;
    chatter: string;
    whisper: string;
    sendAsReply: boolean;
    customVarName: string;
    customVarTtl: number;
}> = {
    definition: {
        id: "firebot:call-lm-studio",
        name: "LM Studio に問い合わせる",
        description: "ローカルの LM Studio AI モデルに問い合わせて回答を取得します",
        icon: "fad fa-robot",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "AI 回答テキスト",
                defaultName: "lmStudioResponse",
                description: "LM Studio から返ってきた回答テキスト"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="LM Studio サーバー設定" pad-top="true">
            <div class="form-group" style="display:flex; gap:16px;">
                <div style="flex:1;">
                    <label class="control-label">ホスト</label>
                    <input type="text" class="form-control" ng-model="effect.host" placeholder="127.0.0.1" />
                </div>
                <div style="width:130px;">
                    <label class="control-label">ポート</label>
                    <input type="number" class="form-control" ng-model="effect.port" placeholder="1234" min="1" max="65535" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label">モデル名 <span class="muted">（空欄で自動選択）</span></label>
                <input type="text" class="form-control" ng-model="effect.modelName" placeholder="ロードされているモデルが自動選択されます" />
            </div>
        </eos-container>

        <eos-container header="プロンプト" pad-top="true">
            <div class="form-group">
                <label class="control-label">システムプロンプト <span class="muted">（任意）</span></label>
                <textarea ng-model="effect.systemPrompt" class="form-control" rows="3"
                    placeholder="あなたは親切なアシスタントです。" replace-variables></textarea>
            </div>
            <div class="form-group">
                <label class="control-label">ユーザーメッセージ</label>
                <textarea ng-model="effect.userPrompt" class="form-control" rows="4"
                    placeholder="質問や指示を入力" replace-variables></textarea>
            </div>
        </eos-container>

        <eos-container header="生成パラメーター" pad-top="true">
            <div class="form-group" style="display:flex; gap:20px; flex-wrap:wrap;">
                <div>
                    <label class="control-label">Temperature</label>
                    <input type="number" class="form-control" ng-model="effect.temperature"
                        placeholder="0.7" min="0" max="2" step="0.1" style="width:100px;" />
                </div>
                <div>
                    <label class="control-label">最大トークン数</label>
                    <input type="number" class="form-control" ng-model="effect.maxTokens"
                        placeholder="512" min="1" max="8192" style="width:120px;" />
                </div>
            </div>
        </eos-container>

        <eos-container header="チャット送信 （任意）" pad-top="true">
            <p class="muted" style="font-size:11px;"><b>返答内容:</b> {replyMessage}</p>
            <textarea ng-model="effect.message" class="form-control" rows="3"
                placeholder="送信しない場合は空欄のままにしてください。{replyMessage} で AI の回答を挿入できます。"
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
            <p class="muted" style="font-size:11px;">AI の回答を <code>$customVariable[名前]</code> で参照できるカスタム変数に保存します。</p>
            <div class="form-group" style="display:flex; gap:16px; align-items:flex-end;">
                <div style="flex:1;">
                    <label class="control-label">変数名 <span class="muted">（空欄でスキップ）</span></label>
                    <input type="text" class="form-control" ng-model="effect.customVarName"
                        placeholder="aiResponse" replace-variables />
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
        if ($scope.effect.host == null) {
            $scope.effect.host = "127.0.0.1";
        }
        if ($scope.effect.port == null) {
            $scope.effect.port = 1234;
        }
        if ($scope.effect.temperature == null) {
            $scope.effect.temperature = 0.7;
        }
        if ($scope.effect.maxTokens == null) {
            $scope.effect.maxTokens = 512;
        }
        if ($scope.effect.customVarTtl == null) {
            $scope.effect.customVarTtl = 0;
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.userPrompt) {
            errors.push("ユーザーメッセージを入力してください");
        }
        if (effect.port == null) {
            errors.push("ポート番号を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        const twitchChat = require("../../chat/twitch-chat");
        const chatHelpers = require("../../chat/chat-helpers");
        const commandHandler = require("../../chat/commands/chat-command-handler");

        try {
            const host = effect.host || "127.0.0.1";
            const port = effect.port || 1234;

            const messages: Array<{ role: string, content: string }> = [];
            if (effect.systemPrompt) {
                messages.push({ role: "system", content: effect.systemPrompt });
            }
            messages.push({ role: "user", content: effect.userPrompt });

            const body: Record<string, unknown> = {
                messages,
                temperature: effect.temperature ?? 0.7,
                max_tokens: effect.maxTokens ?? 512,
                stream: false
            };
            if (effect.modelName) {
                body.model = effect.modelName;
            }

            const response = await fetch(`http://${host}:${port}/v1/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                logger.error(`LM Studio リクエスト失敗: ${response.status} ${response.statusText}`);
                return false;
            }

            const data: { choices?: Array<{ message?: { content?: string } }> } = await response.json();
            const replyText = data.choices?.[0]?.message?.content ?? "";

            if (effect.message) {
                const chatMessage = effect.message.replace("{replyMessage}", replyText);

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
                CustomVariableManager.addCustomVariable(effect.customVarName, replyText, effect.customVarTtl ?? 0);
            }

            return {
                success: true,
                outputs: { lmStudioResponse: replyText }
            };
        } catch (error) {
            logger.error("LM Studio リクエストエラー", (error as Error).message);
            return false;
        }
    }
};

export = model;
