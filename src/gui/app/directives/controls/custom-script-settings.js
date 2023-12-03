"use strict";

(function() {
    const fs = require("fs-extra");

    angular
        .module('firebotApp')
        .component("customScriptSettings", {
            bindings: {
                effect: "=",
                modalId: "<",
                trigger: "<",
                triggerMeta: "<",
                allowStartup: "<"
            },
            template: `
            <eos-container header="Script">

                <div class="effect-info alert alert-info">
                    Place scripts in the <a id="scriptFolderBtn" ng-click="openScriptsFolder()" style="text-decoration:underline;color:#53afff;cursor:pointer;">スクリプトフォルダ</a>にある、Firebotのユーザー設定枠で、選択肢を更新してください。
                </div>

                <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="script-type">{{effect.scriptName ? effect.scriptName : 'Pick one'}}</span> <span class="caret"></span>
                    </button>
                    <a ng-click="getNewScripts()" id="refreshScriptList" style="padding-left:5px;height:100%;cursor:pointer;"><i class="far fa-sync" id="refreshIcon" style="margin-top:10px;" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu script-dropdown">
                        <li ng-show="scriptArray.length == 0" class="muted">
                            <a href>スクリプトがありません</a>
                        </li>
                        <li ng-repeat="script in scriptArray" ng-click="selectScript(script)">
                            <a href>{{script}}</a>
                        </li>
                    </ul>
                </div>
            </eos-container>

            <eos-container ng-show="effect.scriptName != null" pad-top="true">
                <div ng-if="scriptManifest != null" style="padding-bottom:10px;">
                    <div class="script-name">{{scriptManifest.name ? scriptManifest.name : "名無し"}} <span class="script-version muted">{{scriptManifest.version ? scriptManifest.version : "不明"}}</span></div>
                    <div style="font-size: 13px;">by <span class="script-author">{{scriptManifest.author ? scriptManifest.author : "不明"}}</span><span ng-if="scriptManifest.website" class="script-website"> (<a ng-click="openScriptsWebsite()" class="clickable">{{scriptManifest.website}}</a>)</span><span></span></div>
                    <div class="script-description">{{scriptManifest.description}}</div>
                </div>
            </eos-container>

            <eos-container header="Script Options" ng-show="effect.scriptName != null">
                <div ng-show="isLoadingParameters">
                    設定を読込中...
                </div>
                <div ng-hide="isLoadingParameters">
                    <span ng-hide="scriptHasParameters()" class="muted">このスクリプトには設定がありません.</span>
                    <div ng-show="scriptHasParameters()">
                        <script-parameter-option ng-repeat="(parameterName, parameterMetadata) in effect.parameters"
                        name="parameterName"
                        metadata="parameterMetadata"
                        trigger="{{trigger}}"
                        trigger-meta="triggerMeta"
                        modalId="{{modalId}}"></script-parameter-option>
                    </div>
                </div>
            </eos-container>

            <eos-container>
                <div class="effect-info alert alert-danger">
                    <strong>注意:</strong> あなたが信頼できるスクリプト以外、使用してはいけません
                </div>
            </eos-container>
            `,
            controller: function($scope, utilityService, $rootScope, $q, logger,
                backendCommunicator, profileManager) {

                const $ctrl = this;

                function loadParameters(scriptName, initialLoad = true) {
                    logger.info("Attempting to load custom script parameters...");
                    $scope.isLoadingParameters = true;

                    const scriptsFolder = profileManager.getPathInProfile("/scripts");
                    const scriptFilePath = path.resolve(scriptsFolder, scriptName);
                    // Attempt to load the script
                    try {
                        // Make sure we first remove the cached version, incase there was any changes
                        delete require.cache[require.resolve(scriptFilePath)];

                        const customScript = require(scriptFilePath);

                        //grab the manifest
                        if (typeof customScript.getScriptManifest === "function") {
                            $scope.scriptManifest = customScript.getScriptManifest();
                        } else {
                            $scope.scriptManifest = null;
                        }

                        if ($scope.scriptManifest != null && $scope.scriptManifest.startupOnly && !$ctrl.allowStartup) {
                            utilityService.showInfoModal(`スクリプト '${$scope.effect.scriptName}' をロードできません。このスクリプトは起動時スクリプトとしてのみ利用可能です。 (設定 > 応用 > 起動時スクリプト`);
                            $scope.effect.scriptName = undefined;
                            $scope.effect.parameters = undefined;
                            $scope.scriptManifest = undefined;
                            return;
                        }

                        if ($scope.scriptManifest && $scope.scriptManifest.name && $ctrl.trigger === 'startup_script') {
                            $scope.effect.name = $scope.scriptManifest.name;
                        }

                        if (!initialLoad && ($scope.scriptManifest == null || $scope.scriptManifest.firebotVersion !== "5")) {
                            utilityService.showInfoModal("このスクリプトはFirebot V5用に設計されていないため、期待通りに機能しない可能性があります。サポートが必要な場合は、DiscordまたはX(旧Twitter)でご相談ください。");
                        }

                        const currentParameters = $scope.effect.parameters;
                        if (typeof customScript.getDefaultParameters === "function") {
                            const parameterRequest = {
                                modules: {
                                    request: require("request")
                                }
                            };
                            const parametersPromise = customScript.getDefaultParameters(
                                parameterRequest
                            );

                            $q.when(parametersPromise).then(parameters => {
                                const defaultParameters = parameters;

                                if (currentParameters != null) {
                                    //get rid of old params that no longer exist
                                    Object.keys(currentParameters).forEach(
                                        currentParameterName => {
                                            const currentParamInDefaults = defaultParameters[currentParameterName];
                                            if (currentParamInDefaults == null) {
                                                delete currentParameters[currentParameterName];
                                            }
                                        }
                                    );

                                    //handle any new params
                                    Object.keys(defaultParameters).forEach(
                                        defaultParameterName => {
                                            const currentParam = currentParameters[defaultParameterName];
                                            const defaultParam = defaultParameters[defaultParameterName];
                                            if (currentParam != null) {
                                                //Current param exists lets update the value.
                                                defaultParam.value = currentParam.value;
                                            }
                                            currentParameters[defaultParameterName] = defaultParam;
                                        }
                                    );
                                } else {
                                    $scope.effect.parameters = defaultParameters;
                                }
                                $scope.isLoadingParameters = false;
                            });
                        } else {
                            $scope.isLoadingParameters = false;
                        }
                    } catch (err) {
                        utilityService.showErrorModal("スクリプト '" + scriptName + "'の読み込みに失敗しました。\n\n" + err);
                        logger.error(err);
                    }
                }

                $scope.isLoadingParameters = true;

                const scriptFolderPath = profileManager.getPathInProfile("/scripts");
                // Grab files in folder when button effect shown.
                $scope.scriptArray = fs.readdirSync(scriptFolderPath);

                // Grab files in folder on refresh click.
                $scope.getNewScripts = function() {
                    $scope.scriptArray = fs.readdirSync(scriptFolderPath);
                    if ($scope.effect.scriptName != null) {
                        loadParameters($scope.effect.scriptName);
                    }
                };

                // Open script folder on click.
                $scope.openScriptsFolder = function() {
                    backendCommunicator.fireEvent("openScriptsFolder");
                };

                $scope.openScriptsWebsite = function() {
                    if (!$scope.scriptManifest || !$scope.scriptManifest.website) {
                        return;
                    }

                    $rootScope.openLinkExternally($scope.scriptManifest.website);
                };

                $scope.selectScript = function(scriptName) {
                    $scope.effect.scriptName = scriptName;
                    $scope.effect.parameters = null;
                    $scope.scriptManifest = null;
                    loadParameters(scriptName, false);
                };

                $scope.scriptHasParameters = function() {
                    return ($scope.effect.parameters != null &&
                        Object.keys($scope.effect.parameters).length > 0);
                };

                $ctrl.$onInit = () => {

                    $scope.effect = $ctrl.effect;
                    $scope.modalId = $ctrl.modalId;
                    $scope.trigger = $ctrl.trigger;
                    $scope.triggerMeta = $ctrl.triggerMeta;

                    if ($scope.effect.scriptName != null) {
                        loadParameters($scope.effect.scriptName);
                    }
                };
            }
        });
}());