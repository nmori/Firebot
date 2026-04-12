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
        name: "HTTP繝ｪ繧ｯ繧ｨ繧ｹ繝・,
        description: "荳弱∴繧峨ｌ縺欟RL縺ｫHTTP繝ｪ繧ｯ繧ｨ繧ｹ繝医ｒ騾√ｋ",
        icon: "fad fa-terminal",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: [],
        outputs: [
            {
                label: "霑皮ｭ疲悽譁・,
                description: "繝ｪ繧ｯ繧ｨ繧ｹ繝医°繧峨・逕溘・繝ｬ繧ｹ繝昴Φ繧ｹ",
                defaultName: "httpResponse"
            }
        ]
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="URL">
        <firebot-input model="effect.url" placeholder-text="url繧貞・繧後ｋ" menu-position="below"></firebot-input>
    </eos-container>

    <eos-container header="騾壻ｿ｡繝｡繧ｽ繝・ラ" pad-top="true">
        <dropdown-select options="['GET', 'POST', 'PUT', 'PATCH', 'DELETE']" selected="effect.method"></dropdown-select>
    </eos-container>

    <eos-container header="繝・・繧ｿ (JSON)" pad-top="true" ng-show="['POST', 'PUT', 'PATCH'].includes(effect.method)">
        <div
            ui-codemirror="{onLoad : codemirrorLoaded}"
            ui-codemirror-opts="editorSettings"
            ng-model="effect.body"
            replace-variables
            menu-position="under">
        </div>
    </eos-container>

    <eos-container header="繝倥ャ繝" pad-top="true">
        <div ui-sortable="sortableOptions" ng-model="effect.headers">
            <div ng-repeat="header in effect.headers track by $index" class="list-item selectable" ng-click="showAddOrEditHeaderModal(header)">
                <span class="dragHandle" style="height: 38px; width: 15px; align-items: center; justify-content: center; display: flex">
                    <i class="fal fa-bars" aria-hidden="true"></i>
                </span>
                <div uib-tooltip="繧ｯ繝ｪ繝・け縺励※邱ｨ髮・  style="font-weight: 400;width: 100%;margin-left: 20px;" aria-label="{{header.key + ' (繧ｯ繝ｪ繝・け縺励※邱ｨ髮・'}}"><b>{{header.key}}</b>: {{header.value}}</div>
                <span class="clickable" style="color: #fb7373;" ng-click="removeHeaderAtIndex($index);$event.stopPropagation();" aria-label="繝倥ャ繝繧貞炎髯､">
                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                </span>
            </div>
            <p class="muted" ng-show="effect.headers.length < 1">繝倥ャ繝縺ｯ縺ゅｊ縺ｾ縺帙ｓ</p>
        </div>
        <div style="margin: 5px 0 10px 0px;">
            <button class="filter-bar" ng-click="showAddOrEditHeaderModal()" uib-tooltip="繝倥ャ繝繧定ｿｽ蜉" tooltip-append-to-body="true" aria-label="繝倥ャ繝繧定ｿｽ蜉">
                <i class="far fa-plus"></i>
            </button>
        </div>
    </eos-container>

    <eos-container header="繧ｪ繝励す繝ｧ繝ｳ" pad-top="true">
        <firebot-checkbox
            label="Twitch 縺ｮ隱崎ｨｼ繧ｳ繝ｼ繝峨ｒ蜷ｫ繧"
            tooltip="Twitch API繧剃ｽｿ縺・凾莉･螟悶・蜊ｱ髯ｺ縺ｪ縺ｮ縺ｧON縺ｫ縺励↑縺・〒縺上□縺輔＞!"
            model="effect.options.useTwitchAuth"
        />
        <label ng-show="effect.options.putResponseInVariable" class="control-fb control--checkbox">邨先棡繧貞､画焚縺ｫ譬ｼ邏・<tooltip text="'邨先棡繧貞､画焚縺ｫ譬ｼ邏阪＠縺ｦ縲∝ｾ後°繧画ｴｻ逕ｨ縺励∪縺・"></tooltip>
            <input type="checkbox" ng-model="effect.options.putResponseInVariable">
            <div class="control__indicator"></div>
        </label>
        <div ng-if="effect.options.putResponseInVariable" style="padding-left: 15px;">
            <firebot-input input-title="螟画焚蜷・ model="effect.options.variableName" placeholder-text="蜷榊燕繧貞・繧後ｋ" />
            <firebot-input style="margin-top: 10px;" input-title="螟画焚縺ｮ邯咏ｶ壽凾髢・ model="effect.options.variableTtl" input-type="number" disable-variables="true" placeholder-text="遘呈焚繧貞・繧後ｋ | 莉ｻ諢・ />
            <firebot-input style="margin-top: 10px;" input-title="螟画焚縺ｮ繝代せ" model="effect.options.variablePropertyPath" input-type="text" disable-variables="true" placeholder-text="莉ｻ諢・ />
        </div>
        <firebot-checkbox
            ng-init="timeoutRequest = effect.options.timeout != null"
            label="繧ｿ繧､繝繧｢繧ｦ繝医ｒ險ｭ螳・
            tooltip="繝ｪ繧ｯ繧ｨ繧ｹ繝医・繧ｿ繧､繝繧｢繧ｦ繝域凾髢薙ｒ險ｭ螳壹＠縺ｾ縺・
            model="timeoutRequest"
        />
        <div ng-show="timeoutRequest" style="padding-left: 15px;" class="mb-6">
            <firebot-input input-title="Timeout (ms)" model="effect.options.timeout" input-type="number" disable-variables="true" placeholder-text="Enter ms" />
        </div>
    </eos-container>

    <eos-container header="繧ｨ繝ｩ繝ｼ譎ゅ・貍泌・" pad-top="true" ng-if="effect.options.runEffectsOnError">
        <effect-list effects="effect.errorEffects"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            update="errorEffectsUpdated(effects)"
            modalId="{{modalId}}"></effect-list>
    </eos-container>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-warning">
        豕ｨ諢・ 繝ｪ繧ｯ繧ｨ繧ｹ繝医お繝ｩ繝ｼ縺ｯ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ縺ｫ險倬鹸縺輔ｌ縲√え繧｣繝ｳ繝峨え竊帝幕逋ｺ閠・ヤ繝ｼ繝ｫ縺ｮ蛻・ｊ譖ｿ縺・縺九ｉ繧｢繧ｯ繧ｻ繧ｹ縺ｧ縺阪∪縺吶・        </div>
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
                name: "繧ｭ繝ｼ",
                icon: "fa-key",
                cellTemplate: `{{data.key}}`,
                cellController: () => {}
            },
            {
                name: "蛟､",
                icon: "fa-tag",
                cellTemplate: `{{data.value}}`,
                cellController: () => {}
            }
        ];

        $scope.headerOptions = (item) => {
            const options = [
                {
                    html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 邱ｨ髮・/a>`,
                    click: function () {
                        $scope.showAddOrEditHeaderModal(item);
                    }
                },
                {
                    html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 蜑企勁</a>`,
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
            errors.push("HTTP繝｡繧ｽ繝・ラ繧帝∈謚槭＠縺ｦ縺上□縺輔＞");
        }
        if (effect.url === "" || effect.url == null) {
            errors.push("URL繧呈蕗縺医※縺上□縺輔＞縲・);
        }
        return errors;
    },
    onTriggerEvent: async event => {

        const logger = require("../../logwrapper");
        const twitchAuth = require("../../auth/twitch-auth");
        const accountAccess = require("../../common/account-access");
        const customVariableManager = require("../../common/custom-variable-manager");
        const effectRunner = require("../../common/effect-runner");

        const { effect, trigger, outputs } = event;

        let headers = effect.headers.reduce((acc, next) => {
            acc[next.key] = next.value;
            return acc;
        }, {});

        if (effect.options.useTwitchAuth && effect.url.startsWith("https://api.twitch.tv")) {
            const accessToken = accountAccess.getAccounts().streamer.auth.access_token;
            headers = {
                ...headers,
                'Authorization': `Bearer ${accessToken}`,
                'Client-ID': twitchAuth.twitchClientId
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
                    effects: effect.errorEffects,
                    outputs: outputs
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
