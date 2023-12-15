"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const axiosDefault = require("axios").default;

const axios = axiosDefault.create({
    headers: {
        'User-Agent': 'Firebot v5 - OneComme Effect'
    }
});

axios.interceptors.request.use(request => {
    //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
    return request;
});

axios.interceptors.response.use(response => {
    //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
    return response;
});

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

        $scope.errorEffectsUpdated = function(effects) {
            $scope.effect.errorEffects = effects;
        };

        $scope.editorSettings = {
            mode: { name: "javascript", json: true },
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

        $scope.sortableOptions = {
            handle: ".dragHandle",
            stop: () => {}
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
        let responseData;
        try {
            const response = await axios({
                method: 'POST',
                url: 'http://127.0.0.1:11180/api/reactions',
                headers,
                data: sendBodyData
            });

            responseData = response.data;

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return {
            success: true,
            outputs: {
                httpResponse: responseData
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