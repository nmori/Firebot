"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:oneccome-wordparty",
        name: "わんコメ WordParty",
        description: "わんコメのWordPartyに起動トリガーを送ります",
        icon: "fad fa-paw",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: []
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="送信する起動キー">
        <firebot-input model="effect.key" placeholder-text="起動キーの入力" menu-position="below"></firebot-input>
    </eos-container>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-warning">
        注意: わんコメのWordPartyの設定が別途必要です。
        </div>
    </eos-container>

    `,
    optionsController: ($scope, utilityService) => {

        $scope.errorEffectsUpdated = function (effects) {
            $scope.effect.errorEffects = effects;
        };

        $scope.editorSettings = {
            mode: { name: "javascript", json: true },
            theme: 'blackboard',
            lineNumbers: true,
            autoRefresh: true,
            showGutter: true
        };

        $scope.codemirrorLoaded = function (_editor) {
            // Editor part
            _editor.refresh();
            const cmResize = require("cm-resize");
            cmResize(_editor, {
                minHeight: 200,
                resizableWidth: false,
                resizableHeight: true
            });
        };

        $scope.sortableOptions = {
            handle: ".dragHandle",
            stop: () => { }
        };

        $scope.showAddOrEditHeaderModal = (header) => {
            utilityService.showModal({
                component: "addOrEditHeaderModal",
                size: "sm",
                resolveObj: {
                    header: () => header
                },
                closeCallback: newHeader => {
                    console.log(newHeader);
                    $scope.effect.headers = $scope.effect.headers.filter(h => h.key !== newHeader.key);
                    $scope.effect.headers.push(newHeader);
                }
            });
        };

        if ($scope.effect.headers == null) {
            $scope.effect.headers = [];
        }

        if ($scope.effect.options == null) {
            $scope.effect.options = {};
        }

        $scope.removeHeaderAtIndex = (index) => {
            $scope.effect.headers.splice(index, 1);
        };


    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.key === "" || effect.key == null) {
            errors.push("起動キーをいれてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {

        const logger = require("../../logwrapper");
        const { effect } = event;

        const sendBodyData = JSON.stringify({ reactions: [{ "key": effect.key, "value": 1 }], effect: true });
        const headers = {
            'Content-Type': `application/json`
        };

        try {

            const response = await fetch(
                'http://localhost:11180/api/reactions',
                {
                    method: 'POST',
                    headers: headers,
                    body: sendBodyData
                });

            let responseData = await response.text();
            return {
                success: true,
                outputs: {
                    httpResponse: responseData
                }
            };

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return {
            success: false,
            outputs: {
            }
        };
    },
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {}
    }
};

module.exports = effect;