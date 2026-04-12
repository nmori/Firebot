import { EffectType } from "../../../../../types/effects";
import { sendRawObsRequest } from "../obs-remote";

export const SendRawOBSWebSocketRequestEffectType: EffectType<{
    functionName: string,
    payload: string
}> = {
    definition: {
        id: "firebot:send-raw-obs-websocket-request",
        name: "OBS生WebSocketリクエスト送信",
        description: "OBS に生の WebSocket リクエストを送信します",
        icon: "fad fa-plug",
        categories: ["advanced", "integrations"],
        outputs: [
            {
                label: "APIレスポンス",
                description: "OBS WebSocket API からの生レスポンス",
                defaultName: "apiResponse"
            }
        ]
    },
    optionsTemplate: `
    <eos-container header="関数名">
        <firebot-input model="effect.functionName" placeholder-text="OBS WebSocket の関数名を入力" menu-position="below" disable-variables="true"></firebot-input>
    </eos-container>

    <eos-container header="リクエストペイロード" pad-top="true">
        <div
            ui-codemirror="{onLoad : codemirrorLoaded}"
            ui-codemirror-opts="editorSettings"
            ng-model="effect.payload"
            replace-variables
            menu-position="under">
        </div>
    </eos-container>

    <eos-container pad-top="true">
      <div class="effect-info alert alert-warning">
                <b>警告！</b> OBS で意図しない動作を引き起こす可能性があります。このエフェクトの使用には注意してください。
      </div>
    </eos-container>
  `,
    optionsController: ($scope) => {
        $scope.editorSettings = {
            mode: {name: "javascript", json: true},
            theme: 'blackboard',
            lineNumbers: true,
            autoRefresh: true,
            showGutter: true
        };

        $scope.codemirrorLoaded = function(_editor) {
        // Editor part
            _editor.refresh();
            const cmResize = require("cm-resize");
            cmResize(_editor, {
                minHeight: 200,
                resizableWidth: false,
                resizableHeight: true
            });
        };
    },
    optionsValidator: (effect) => {
        if (effect.functionName == null || effect.functionName.length === 0) {
            return ["関数名を入力してください。"];
        }
        return [];
    },
    getDefaultLabel: (effect) => {
        return `${effect.functionName}`;
    },
    onTriggerEvent: async ({ effect }) => {
        const response = await sendRawObsRequest(effect.functionName, effect.payload);

        return {
            success: response.success,
            outputs: {
                apiResponse: response.response
            }
        };
    }
};
