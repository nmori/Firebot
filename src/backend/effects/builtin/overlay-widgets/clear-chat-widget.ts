import type { EffectType } from "../../../../types";

import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";

const model: EffectType<{
    chatWidgetId: string;
}> = {
    definition: {
        id: "firebot:clear-chat-widget",
        name: "チャットウィジェットのクリア",
        description: "チャットウィジェットのメッセージをすべて消去します。",
        icon: "fad fa-eraser",
        categories: ["overlay", "advanced"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container ng-hide="hasChatWidgets">
            <p>この演出を使うには Chat または Chat（Advanced）のオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </eos-container>

        <eos-container header="チャットウィジェット" ng-show="hasChatWidgets">
            <firebot-overlay-widget-select
                overlay-widget-types="['firebot:chat','firebot:chat-advanced']"
                ng-model="effect.chatWidgetId"
            />
        </eos-container>
    `,
    optionsController: ($scope, overlayWidgetsService) => {
        $scope.hasChatWidgets = overlayWidgetsService.hasOverlayWidgetConfigsOfType("firebot:chat")
            || overlayWidgetsService.hasOverlayWidgetConfigsOfType("firebot:chat-advanced");
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.chatWidgetId == null) {
            errors.push("チャットウィジェットを選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, overlayWidgetsService) => {
        const chatWidgetName = overlayWidgetsService.getOverlayWidgetConfig(effect.chatWidgetId)?.name as string ?? "不明なチャットウィジェット";
        return chatWidgetName;
    },
    onTriggerEvent: ({ effect }) => {
        if (effect.chatWidgetId == null) {
            return false;
        }

        overlayWidgetConfigManager.setWidgetStateById(effect.chatWidgetId, {
            chatMessages: null
        });

        return true;
    }
};

export = model;