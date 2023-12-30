import { EffectType } from "../../../../../types/effects";
import { sendRawObsRequest } from "../obs-remote";

export const SendRawOBSWebSocketRequestEffectType: EffectType<{
    functionName: string,
    payload: string
}> = {
  definition: {
    id: "firebot:send-raw-obs-websocket-request",
    name: "OBS WebSocket �R�}���h���M",
    description: "OBS WebSocket �̐����N�G�X�g�𑗐M���܂�",
    icon: "fad fa-plug",
    categories: ["advanced"],
    outputs: [
      {
        label: "API ����",
        description: "OBS WebSocket API����̉���",
        defaultName: "apiResponse"
      }
    ]
  },
  optionsTemplate: `
    <eos-container header="�֐���">
        <firebot-input model="effect.functionName" placeholder-text="OBS Websocket�̊֐���" menu-position="below" disable-variables="true"></firebot-input>
    </eos-container>

    <eos-container header="���N�G�X�g�f�[�^" pad-top="true">
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
        <b>�x��!</b> �����OBS�ɂ����Ė]�܂����Ȃ����ʂ������N�����\��������܂��B���̉��o���g�p����ۂ͂����ӂ��������B
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
        return [ "�֐���������Ă�������" ]
        }
        return [];
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
