"use strict";
(function() {

    const uuidv1 = require("uuid/v1");

    angular
        .module('firebotApp')
        .component("restrictionsList", {
            bindings: {
                trigger: "@",
                triggerMeta: "<",
                restrictionData: "=",
                modalId: "@"
            },
            template: `
                <div>
                    <div style="padding-bottom: 4px;padding-left: 2px;font-size: 13px;font-family: 'Quicksand'; color: #8A8B8D;">
                        <span>起動条件 </span>

                        <div class="text-dropdown filter-mode-dropdown" uib-dropdown uib-dropdown-toggle>
                            <div class="noselect pointer ddtext" style="font-size: 12px;">
                                <a href aria-label="Control Restrictions Options">
                                    {{$ctrl.getRestrictionModeDisplay()}}
                                    <span class="fb-arrow down ddtext"></span>
                                </a>
                            </div>
                            <ul class="dropdown-menu" style="z-index: 10000000;" uib-dropdown-menu>

                                <li ng-click="$ctrl.restrictionData.mode = 'all'">
                                    <a href style="padding-left: 10px;" aria-label="all restrictions pass">すべて</a>
                                </li>

                                <li ng-click="$ctrl.restrictionData.mode = 'any'">
                                    <a href style="padding-left: 10px;" aria-label="any restrictions pass">いずれか</a>
                                </li>

                                <li ng-click="$ctrl.restrictionData.mode = 'none'">
                                    <a href style="padding-left: 10px;" aria-label="no restrictions pass">制限なし</a>
                                </li>
                            </ul>
                        </div>
                        <span>:</span>
                    </div>
                    <div ng-class="{'mb-4': $ctrl.restrictionData.restrictions.length}">
                        <restriction-item ng-repeat="restriction in $ctrl.restrictionData.restrictions"
                            restriction="restriction"
                            restriction-definition="$ctrl.getRestrictionDefinition(restriction.type)"
                            restriction-mode="$ctrl.restrictionData.mode"
                            on-delete="$ctrl.deleteRestriction(restriction.id)">
                        </restriction-item>
                    </div>
                    <div class="mb-4">
                        <div class="filter-bar clickable"
                            ng-show="$ctrl.canAddMoreRestrictions"
                            ng-click="$ctrl.showAddRestrictionModal()"
                            uib-tooltip="Add Restriction"
                            aria-label="Add Restriction"
                            tooltip-append-to-body="true">
                                <i class="far fa-plus"></i>
                        </div>
                    </div>
                    <div class="ml-3.5" ng-show="$ctrl.restrictionData.restrictions.length > 0">
                        <label class="control-fb control--checkbox"> 制限が満たされていない場合にチャット メッセージを送信する
                            <input type="checkbox" ng-model="$ctrl.restrictionData.sendFailMessage">
                            <div class="control__indicator"></div>
                        </label>

                        <div ng-show="$ctrl.restrictionData.sendFailMessage">
                            <label class="control-fb control--checkbox">
                                自作したメッセージを使用する
                                <input
                                    type="checkbox"
                                    ng-model="$ctrl.restrictionData.useCustomFailMessage"
                                />
                                <div class="control__indicator"></div>
                            </label>

                            <div ng-if="$ctrl.restrictionData.useCustomFailMessage">
                                <firebot-input
                                    model="$ctrl.restrictionData.failMessage"
                                    disable-variables="true"
                                    input-title="Message"
                                />
                                <p class="muted">使用可能な変数: {user}, {reason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            controller: function(utilityService, backendCommunicator) {
                const $ctrl = this;

                const restrictionDefinitions = backendCommunicator.fireEventSync("getRestrictions")
                    .map(r => {
                        return {
                            definition: r.definition,
                            optionsTemplate: r.optionsTemplate,
                            optionsController: eval(r.optionsControllerRaw), // eslint-disable-line no-eval
                            optionsValueDisplay: eval(r.optionsValueDisplayRaw) // eslint-disable-line no-eval
                        };
                    });

                $ctrl.getRestrictionModeDisplay = function() {
                    if ($ctrl.restrictionData.mode === "any") {
                        return "いずれか";
                    }
                    if ($ctrl.restrictionData.mode === "none") {
                        return "適用なし";
                    }
                    return "すべて";
                };

                $ctrl.canAddMoreRestrictions = true;
                function updateCanAddMoreRestrictions() {
                    /*$ctrl.canAddMoreRestrictions = restrictionDefinitions
                        .some(r => {
                            return !$ctrl.restrictionData.restrictions.some(rs => rs.type === r.definition.id);
                        });*/
                }

                $ctrl.$onInit = function() {
                    if ($ctrl.restrictionData == null) {
                        $ctrl.restrictionData = {
                            restrictions: [],
                            mode: "all",
                            sendFailMessage: true,
                            useCustomFailMessage: false,
                            failMessage: "このコマンドは使用できません: {reason}"
                        };
                    }

                    if ($ctrl.restrictionData.mode == null) {
                        $ctrl.restrictionData.mode = "all";
                    }

                    if ($ctrl.restrictionData.restrictions == null) {
                        $ctrl.restrictionData.restrictions = [];
                    }

                    if ($ctrl.restrictionData.sendFailMessage == null) {
                        $ctrl.restrictionData.sendFailMessage = true;
                    }

                    if ($ctrl.restrictionData.failMessage == null) {
                        $ctrl.restrictionData.failMessage = "このコマンドは使用できません: {reason}";
                    }

                    updateCanAddMoreRestrictions();
                };

                $ctrl.deleteRestriction = function(restrictionId) {
                    $ctrl.restrictionData.restrictions = $ctrl.restrictionData.restrictions
                        .filter(r => r.id !== restrictionId);

                    updateCanAddMoreRestrictions();
                };

                $ctrl.getRestrictionDefinition = function(restrictionType) {
                    return restrictionDefinitions.find(r => r.definition.id === restrictionType);
                };

                $ctrl.showAddRestrictionModal = function() {

                    const options = restrictionDefinitions
                        .filter(r => !r.definition.hidden)
                        .map(r => {
                            return {
                                id: r.definition.id,
                                name: r.definition.name,
                                description: r.definition.description
                            };
                        }).sort((a, b) => {
                            const textA = a.name.toUpperCase();
                            const textB = b.name.toUpperCase();
                            return textA < textB ? -1 : textA > textB ? 1 : 0;
                        });

                    utilityService.openSelectModal(
                        {
                            label: "制限の追加",
                            options: options,
                            saveText: "Add",
                            validationText: "追加する制限の種類を選んでください"

                        },
                        (selectedId) => {
                            // just in case, remove any other restrictions of the same type
                            /*$ctrl.restrictionData.restrictions = $ctrl.restrictionData.restrictions
                                .filter(r => r.type !== selectedId);*/

                            $ctrl.restrictionData.restrictions.push({
                                id: uuidv1(),
                                type: selectedId
                            });

                            updateCanAddMoreRestrictions();
                        });
                };
            }
        });
}());
