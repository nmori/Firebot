import { EffectType } from "../../../types/effects";
import frontendCommunicator from "../../common/frontend-communicator";

const effect: EffectType<{
    alertType: "info" | "success" | "warning" | "danger";
    message: string;
    dismissType: "timeout" | "manual";
    timeout: number;
}> = {
    definition: {
        id: "firebot:show-toast",
        name: "トースト通知表示",
        description: "Firebot メインウィンドウ上部にトースト通知を表示します。",
        icon: "fad fa-comment-alt-exclamation",
        categories: ["advanced", "scripting"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="メッセージテキスト">
            <p class="muted">トースト通知に表示したいメッセージを入力してください。</p>
            <firebot-input
                title="メッセージ"
                model="effect.message"
                placeholder-text="トースト通知テキストを入力"
                menu-position="under"
            />
        </eos-container>

        <eos-container header="アラート種別" pad-top="true">
            <firebot-select
                options="{ info: '情報', success: '成功', warning: '警告', danger: 'エラー' }"
                selected="effect.alertType"
            />
        </eos-container>

        <eos-container header="閉じ方" pad-top="true">
            <firebot-select
                options="{ timeout: '自動で閉じる', manual: '手動で閉じる' }"
                selected="effect.dismissType"
            />
        </eos-container>

        <eos-container ng-if="effect.dismissType === 'timeout'" header="自動クローズまでの時間" pad-top="true">
            <firebot-input
                input-title="秒数"
                model="effect.timeout"
                placeholder-text="秒数を入力"
                menu-position="under"
                data-type="number"
            />
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.effect.alertType ??= "info";
        $scope.effect.dismissType ??= "timeout";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!(effect.message?.length > 0)) {
            errors.push("メッセージを入力してください。");
        }
        if (effect.alertType == null) {
            errors.push("アラート種別を選択してください。");
        }
        if (effect.dismissType === "timeout" && !effect.timeout) {
            errors.push("自動クローズまでの秒数を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: ({ effect }) => {
        frontendCommunicator.send("showToast", {
            content: effect.message,
            className: effect.alertType,
            dismissOnTimeout: effect.dismissType === "timeout",
            timeout: effect.dismissType === "timeout"
                ? effect.timeout * 1000
                : undefined
        });
    }
};

export = effect;