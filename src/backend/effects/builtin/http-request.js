"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const axiosDefault = require("axios").default;

const axios = axiosDefault.create({
    headers: {
        'User-Agent': 'Firebot v5 - HTTP Request Effect'
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
        id: "firebot:http-request",
        name: "HTTPリクエスト",
        description: "与えられたURLにHTTPリクエストを送る",
        icon: "fad fa-terminal",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: [],
        outputs: [
            {
                label: "返答本文",
                description: "リクエストからの生のレスポンス",
                defaultName: "httpResponse"
            }
        ]
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="URL">
        <firebot-input model="effect.url" placeholder-text="Enter url" menu-position="below"></firebot-input>
    </eos-container>

    <eos-container header="Method" pad-top="true">
        <dropdown-select options="['GET', 'POST', 'PUT', 'PATCH', 'DELETE']" selected="effect.method"></dropdown-select>
    </eos-container>

    <eos-container header="Body (JSON)" pad-top="true" ng-show="['POST', 'PUT', 'PATCH'].includes(effect.method)">
        <div
            ui-codemirror="{onLoad : codemirrorLoaded}"
            ui-codemirror-opts="editorSettings"
            ng-model="effect.body"
            replace-variables
            menu-position="under">
        </div>
    </eos-container>

    <eos-container header="Headers" pad-top="true">
        <div ui-sortable="sortableOptions" ng-model="effect.headers">
            <div ng-repeat="header in effect.headers track by $index" class="list-item selectable" ng-click="showAddOrEditHeaderModal(header)">
                <span class="dragHandle" style="height: 38px; width: 15px; align-items: center; justify-content: center; display: flex">
                    <i class="fal fa-bars" aria-hidden="true"></i>
                </span>
                <div uib-tooltip="クリックして編集"  style="font-weight: 400;width: 100%;margin-left: 20px;" aria-label="{{header.key + ' (クリックして編集)'}}"><b>{{header.key}}</b>: {{header.value}}</div>
                <span class="clickable" style="color: #fb7373;" ng-click="removeHeaderAtIndex($index);$event.stopPropagation();" aria-label="ヘッダを削除">
                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                </span>
            </div>
            <p class="muted" ng-show="effect.headers.length < 1">ヘッダはありません</p>
        </div>
        <div style="margin: 5px 0 10px 0px;">
            <button class="filter-bar" ng-click="showAddOrEditHeaderModal()" uib-tooltip="ヘッダを追加" tooltip-append-to-body="true" aria-label="ヘッダを追加">
                <i class="far fa-plus"></i>
            </button>
        </div>
    </eos-container>

    <eos-container header="Options" pad-top="true">
        <div style="margin-bottom: 10px;">
            <label class="control-fb control--checkbox"> Include Twitch auth header <tooltip text="'Automatically include an Authorization header with the streamers twitch access token. Only use when calling the Twitch API!'"></tooltip>
                <input type="checkbox" ng-model="effect.options.useTwitchAuth">
                <div class="control__indicator"></div>
            </label>
        </div>
        <label ng-show="effect.options.putResponseInVariable" class="control-fb control--checkbox"> Put response body in a variable <tooltip text="'Put the response body into a variable so you can use it later'"></tooltip>
            <input type="checkbox" ng-model="effect.options.putResponseInVariable">
            <div class="control__indicator"></div>
        </label>
        <div ng-if="effect.options.putResponseInVariable" style="padding-left: 15px;">
            <firebot-input input-title="Variable Name" model="effect.options.variableName" placeholder-text="名前を入れる" />
            <firebot-input style="margin-top: 10px;" input-title="変数の継続時間" model="effect.options.variableTtl" input-type="number" disable-variables="true" placeholder-text="Enter secs | 任意" />
            <firebot-input style="margin-top: 10px;" input-title="変数のパス" model="effect.options.variablePropertyPath" input-type="text" disable-variables="true" placeholder-text="任意" />
        </div>
        <div style="margin-top: 10px;">
            <label class="control-fb control--checkbox"> エラー時に演出を実行 <tooltip text="'リクエストが失敗した場合に演出のリストを実行します。演出のクリーンアップや実行を停止したいときに便利です。'"></tooltip>
                <input type="checkbox" ng-model="effect.options.runEffectsOnError">
                <div class="control__indicator"></div>
            </label>
        </div>
    </eos-container>

    <eos-container header="Error Effects" pad-top="true" ng-if="effect.options.runEffectsOnError">
        <effect-list effects="effect.errorEffects"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            update="errorEffectsUpdated(effects)"
            modalId="{{modalId}}"></effect-list>
    </eos-container>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-warning">
        注意: リクエストエラーはコンソールに記録され、ウィンドウ→開発者ツールの切り替え からアクセスできます。
        </div>
    </eos-container>


    `,
    optionsController: ($scope, utilityService) => {

        $scope.errorEffectsUpdated = function(effects) {
            $scope.effect.errorEffects = effects;
        };

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

        $scope.headers = [
            {
                name: "キー",
                icon: "fa-key",
                cellTemplate: `{{data.key}}`,
                cellController: () => {}
            },
            {
                name: "値",
                icon: "fa-tag",
                cellTemplate: `{{data.value}}`,
                cellController: () => {}
            }
        ];

        $scope.headerOptions = (item) => {
            const options = [
                {
                    html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                    click: function () {
                        $scope.showAddOrEditHeaderModal(item);
                    }
                },
                {
                    html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                    click: function () {
                        $scope.effect.headers = $scope.effect.headers.filter(h => h.key !== item.key);
                    }
                }
            ];
            return options;
        };
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.method === "" || effect.method == null) {
            errors.push("HTTPメソッドを選択してください");
        }
        if (effect.url === "" || effect.url == null) {
            errors.push("URLを教えてください。");
        }
        return errors;
    },
    onTriggerEvent: async event => {

        const logger = require("../../logwrapper");
        const twitchAuth = require("../../auth/twitch-auth");
        const accountAccess = require("../../common/account-access");
        const customVariableManager = require("../../common/custom-variable-manager");
        const effectRunner = require("../../common/effect-runner");

        const { effect, trigger } = event;

        let headers = effect.headers.reduce((acc, next) => {
            acc[next.key] = next.value;
            return acc;
        }, {});

        if (effect.options.useTwitchAuth && effect.url.startsWith("https://api.twitch.tv")) {
            const accessToken = accountAccess.getAccounts().streamer.auth.access_token;
            headers = {
                ...headers,
                'Authorization': `Bearer ${accessToken}`,
                'Client-ID': twitchAuth.TWITCH_CLIENT_ID
            };
        }

        let bodyData = effect.body;
        if (effect.body != null) {
            try {
                bodyData = JSON.parse(effect.body);
            } catch (error) {
                logger.debug("Failed to parse body json for request", error);
            }
        }

        const sendBodyData = effect.method.toLowerCase() === "post" ||
            effect.method.toLowerCase() === "put" ||
            effect.method.toLowerCase() === "patch";

        let responseData;

        try {
            const response = await axios({
                method: effect.method.toLowerCase(),
                url: effect.url,
                headers,
                data: sendBodyData === true ? bodyData : null
            });

            responseData = response.data;

            /**
             * Deprecated
             */
            if (effect.options.putResponseInVariable) {
                customVariableManager.addCustomVariable(
                    effect.options.variableName,
                    response.data,
                    effect.options.variableTtl || 0,
                    effect.options.variablePropertyPath || null
                );
            }
        } catch (error) {
            logger.error("Error running http request", error.message);

            if (effect.options.runEffectsOnError) {
                const processEffectsRequest = {
                    trigger,
                    effects: effect.errorEffects
                };

                const effectResult = await effectRunner.processEffects(processEffectsRequest);
                if (effectResult != null && effectResult.success === true) {
                    if (effectResult.stopEffectExecution) {
                        return {
                            success: true,
                            execution: {
                                stop: true,
                                bubbleStop: true
                            }
                        };
                    }
                }
            }
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
