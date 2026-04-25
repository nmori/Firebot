import { EffectType } from "../../../types/effects";
import HttpServerManager from "../../../server/http-server-manager";
import logger from "../../logwrapper";

const effect: EffectType<{
    eventName: string;
    eventData: string;
}> = {
    definition: {
        id: "firebot:send-custom-websocket-event",
        name: "カスタムWebSocketイベント送信",
        description: "カスタムイベントと関連データをすべての接続済み WebSocket クライアントに送信します",
        icon: "fad fa-plug",
        categories: ["advanced", "scripting"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="イベント名">
            <p class="muted">送信するイベントの名前を入力してください。</p>
            <firebot-input
                model="effect.eventName"
                placeholder-text="イベント名を入力"
                menu-position="under"
            />
            <p class="help-block">次の形式で送信されます: <code>custom-event:{{effect.eventName || 'eventname'}}</code></p>
        </eos-container>

        <eos-container header="イベントデータ" pad-top="true">
            <p class="muted">イベントと一緒に送信したいデータを入力してください。</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.eventData"
            />
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.editors = [
            {
                label: "テキスト",
                inputType: "text",
                useTextArea: true,
                placeholderText: "イベントデータを入力",
                menuPosition: "under"
            },
            {
                label: "JSON",
                inputType: "codemirror",
                menuPosition: "under",
                codeMirrorOptions: {
                    mode: { name: "javascript", json: true },
                    theme: 'blackboard',
                    lineNumbers: true,
                    autoRefresh: true,
                    showGutter: true
                }
            }
        ];

        $scope.initialEditorLabel = $scope.effect?.eventData?.startsWith("{") || $scope.effect?.eventData?.startsWith("[") ? "JSON" : "テキスト";
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!(effect.eventName?.length > 0)) {
            errors.push("イベント名を入力してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return effect.eventName;
    },
    onTriggerEvent: ({ effect }) => {
        try {
            let data: unknown = effect.eventData ?? {};

            try {
                data = JSON.parse(effect.eventData);
            } catch { }
            HttpServerManager.triggerCustomWebSocketEvent(effect.eventName, data as object);
        } catch (error) {
            logger.error(`Error sending custom WebSocket event ${effect.eventName}`, error);
        }
    }
};

export = effect;