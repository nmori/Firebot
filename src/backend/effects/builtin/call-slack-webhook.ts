import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

const model: EffectType<{
    webhookUrl: string;
    message: string;
    username: string;
    iconEmoji: string;
}> = {
    definition: {
        id: "firebot:call-slack-webhook",
        name: "Slack に投稿する",
        description: "Incoming Webhook 経由で Slack のチャンネルにメッセージを送信します",
        icon: "fab fa-slack",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "送信成功フラグ",
                defaultName: "slackSuccess",
                description: "送信に成功した場合は true"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Webhook URL" pad-top="true">
            <input type="text" class="form-control" ng-model="effect.webhookUrl"
                placeholder="https://hooks.slack.com/services/..."
                replace-variables />
            <p class="help-block muted">
                Slack の「Apps」→「Incoming WebHooks」からアプリを作成して URL を取得してください。
            </p>
        </eos-container>

        <eos-container header="メッセージ" pad-top="true">
            <div class="form-group">
                <label class="control-label">テキスト</label>
                <textarea ng-model="effect.message" class="form-control" rows="4"
                    placeholder="送信するメッセージ" replace-variables></textarea>
            </div>
            <div class="form-group">
                <label class="control-label">Bot 名 <span class="muted">（任意）</span></label>
                <input type="text" class="form-control" ng-model="effect.username"
                    placeholder="Firebot" replace-variables />
            </div>
            <div class="form-group">
                <label class="control-label">アイコン絵文字 <span class="muted">（任意）</span></label>
                <input type="text" class="form-control" ng-model="effect.iconEmoji"
                    placeholder=":robot_face:" style="width:200px;" replace-variables />
                <p class="help-block muted">コロンで囲んだ絵文字コード（例: :tada:）</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.username == null) {
            $scope.effect.username = "Firebot";
        }
        if ($scope.effect.iconEmoji == null) {
            $scope.effect.iconEmoji = ":robot_face:";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.webhookUrl) {
            errors.push("Webhook URL を入力してください");
        }
        if (!effect.message) {
            errors.push("テキストを入力してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        try {
            const payload: Record<string, string> = {
                text: effect.message
            };
            if (effect.username) {
                payload.username = effect.username;
            }
            if (effect.iconEmoji) {
                payload.icon_emoji = effect.iconEmoji;
            }

            const response = await fetch(effect.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const success = response.ok;
            if (!success) {
                logger.warn(`Slack webhook 失敗: ${response.status} ${response.statusText}`);
            }

            return { success, outputs: { slackSuccess: success } };
        } catch (error) {
            logger.error("Slack webhook エラー", (error as Error).message);
            return { success: false, outputs: { slackSuccess: false } };
        }
    }
};

export = model;
