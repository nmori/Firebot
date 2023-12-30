"use strict";

(function() {
    const fs = require("fs");

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
                    Place scripts in the <a id="scriptFolderBtn" ng-click="openScriptsFolder()" style="text-decoration:underline;color:#53afff;cursor:pointer;">�X�N���v�g�t�H���_</a>�ɂ���AFirebot�̃��[�U�[�ݒ�g�ŁA�I�������X�V���Ă��������B
                </div>

                <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="script-type">{{effect.scriptName ? effect.scriptName : 'Pick one'}}</span> <span class="caret"></span>
                    </button>
                    <a ng-click="getNewScripts()" id="refreshScriptList" style="padding-left:5px;height:100%;cursor:pointer;"><i class="far fa-sync" id="refreshIcon" style="margin-top:10px;" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu script-dropdown">
                        <li ng-show="scriptArray.length == 0" class="muted">
                            <a href>�X�N���v�g������܂���</a>
                        </li>
                        <li ng-repeat="script in scriptArray" ng-click="selectScript(script)">
                            <a href>{{script}}</a>
                        </li>
                    </ul>
                </div>
            </eos-container>

            <eos-container ng-show="effect.scriptName != null" pad-top="true">
                <div ng-if="scriptManifest != null" style="padding-bottom:10px;">
                    <div class="script-name">{{scriptManifest.name ? scriptManifest.name : "������"}} <span class="script-version muted">{{scriptManifest.version ? scriptManifest.version : "�s��"}}</span></div>
                    <div style="font-size: 13px;">by <span class="script-author">{{scriptManifest.author ? scriptManifest.author : "�s��"}}</span><span ng-if="scriptManifest.website" class="script-website"> (<a ng-click="openScriptsWebsite()" class="clickable">{{scriptManifest.website}}</a>)</span><span></span></div>
                    <div class="script-description">{{scriptManifest.description}}</div>
                </div>
            </eos-container>

            <eos-container header="Script Options" ng-show="effect.scriptName != null">
                <div ng-show="isLoadingParameters">
                    �ݒ��Ǎ���...
                </div>
                <div ng-hide="isLoadingParameters">
                    <span ng-hide="scriptHasParameters()" class="muted">���̃X�N���v�g�ɂ͐ݒ肪����܂���.</span>
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
                    <strong>����:</strong> ���Ȃ����M���ł���X�N���v�g�ȊO�A�g�p���Ă͂����܂���
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
                            utilityService.showInfoModal(`�X�N���v�g '${$scope.effect.scriptName}' �����[�h�ł��܂���B���̃X�N���v�g�͋N�����X�N���v�g�Ƃ��Ă̂ݗ��p�\�ł��B (�ݒ� > ���p > �N�����X�N���v�g`);
                            $scope.effect.scriptName = undefined;
                            $scope.effect.parameters = undefined;
                            $scope.scriptManifest = undefined;
                            return;
                        }

                        if ($scope.scriptManifest && $scope.scriptManifest.name && $ctrl.trigger === 'startup_script') {
                            $scope.effect.name = $scope.scriptManifest.name;
                        }

                        if (!initialLoad && ($scope.scriptManifest == null || $scope.scriptManifest.firebotVersion !== "5")) {
                            utilityService.showInfoModal("���̃X�N���v�g��Firebot V5�p�ɐ݌v����Ă��Ȃ����߁A���Ғʂ�ɋ@�\���Ȃ��\��������܂��B�T�|�[�g���K�v�ȏꍇ�́ADiscord�܂���X(��Twitter)�ł����k���������B");
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
                        utilityService.showErrorModal("�X�N���v�g '" + scriptName + "'�̓ǂݍ��݂Ɏ��s���܂����B\n\n" + err);
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