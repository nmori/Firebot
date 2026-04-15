import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

const model: EffectType<{
    webhookUrl: string;
    title: string;
    message: string;
    themeColor: string;
}> = {
    definition: {
        id: "firebot:call-teams-webhook",
        name: "Microsoft Teams に投稿する",
        description: "Incoming Webhook 経由で Microsoft Teams のチャンネルにメッセージを送信します",
        icon: "fab fa-microsoft",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: [
            {
                label: "送信成功フラグ",
                defaultName: "teamsSuccess",
                description: "送信に成功した場合は true"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Webhook URL" pad-top="true">
            <input type="text" class="form-control" ng-model="effect.webhookUrl"
                placeholder="https://xxx.webhook.office.com/webhookb2/..."
                replace-variables />
            <p class="help-block muted">
                Teams チャンネルの「コネクタ」から Incoming Webhook を作成して URL を取得してください。<br>
                新しい Teams では Power Automate のワークフローで HTTP トリガーを使う方法もあります。
            </p>
        </eos-container>

        <eos-container header="メッセージ" pad-top="true">
            <div class="form-group">
                <label class="control-label">タイトル <span class="muted">（任意）</span></label>
                <input type="text" class="form-control" ng-model="effect.title"
                    placeholder="通知タイトル" replace-variables />
            </div>
            <div class="form-group">
                <label class="control-label">本文</label>
                <textarea ng-model="effect.message" class="form-control" rows="4"
                    placeholder="送信するメッセージ本文" replace-variables></textarea>
            </div>
            <div class="form-group">
                <label class="control-label">テーマカラー <span class="muted">（任意）</span></label>
                <input type="text" class="form-control" ng-model="effect.themeColor"
                    placeholder="0076D7" style="width:160px;" />
                <p class="help-block muted">16 進カラーコード（例: FF0000）</p>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.themeColor == null) {
            $scope.effect.themeColor = "0076D7";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.webhookUrl) {
            errors.push("Webhook URL を入力してください");
        }
        if (!effect.message) {
            errors.push("メッセージ本文を入力してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        try {
            const payload = {
                "@type": "MessageCard",
                "@context": "https://schema.org/extensions",
                themeColor: effect.themeColor || "0076D7",
                summary: effect.title || effect.message.substring(0, 100),
                sections: [
                    {
                        ...(effect.title ? { activityTitle: effect.title } : {}),
                        activityText: effect.message
                    }
                ]
            };

            const response = await fetch(effect.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const success = response.ok;
            if (!success) {
                logger.warn(`Teams webhook 失敗: ${response.status} ${response.statusText}`);
            }

            return { success, outputs: { teamsSuccess: success } };
        } catch (error) {
            logger.error("Teams webhook エラー", (error as Error).message);
            return { success: false, outputs: { teamsSuccess: false } };
        }
    }
};

export = model;
