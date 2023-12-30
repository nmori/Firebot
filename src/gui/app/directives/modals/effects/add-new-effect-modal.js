"use strict";

const { EffectCategory } = require("../../shared/effect-constants");

(function() {
    angular.module("firebotApp").component("addNewEffectModal", {
        template: `
            <div class="modal-header" style="background: #43454A;border-bottom: 2px solid #373C3E;border-top-right-radius: 8px;border-top-left-radius: 8px;">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">新規演出</h4>
            </div>
            <div class="modal-body">
                <div style="height: 55px;background: #43454A;border-bottom: 2px solid #373C3E;display:flex; align-items: center;padding: 0 13px;">
                    <searchbar search-id="effectSearch" placeholder-text="演出を選ぶ..." query="$ctrl.effectSearch" style="width: 100%"></searchbar>
                </div>
                <div style="display: flex;flex-direction:row;height: 450px;">
                    <div style="width: 150px;display:flex;flex-direction:column;height: 100%; flex-shrink: 0;background: #27292c;">
                        <div class="effect-category-header">カテゴリ</div>
                        <div class="effect-category-wrapper" ng-class="{'selected': $ctrl.activeCategory == null}" ng-click="$ctrl.activeCategory = null;">
                            <div class="category-text">All</div>
                        </div>
                        <div class="effect-category-wrapper" ng-repeat="category in $ctrl.categories" ng-class="{'selected': $ctrl.activeCategory === category}" ng-click="$ctrl.activeCategory = category;">
                            <div class="category-text">
                                {{category}}
                                <tooltip
                                    style="margin-left: 5px"
                                    ng-if="category === 'integrations'"
                                    text="'効果的に動作させるには、設定 -> 連携で設定をする必要があります。'"
                                ></tooltip>
                            </div>
                        </div>
                    </div>
                    <div style="width: 100%; height: 100%;overflow-y:scroll;padding: 15px 15px 0;">
                        <div class="effect-def-wrapper" ng-repeat="effect in $ctrl.effectDefs | effectCategoryFilter:$ctrl.activeCategory | filter:$ctrl.effectSearch track by effect.id" ng-click="$ctrl.selectedEffectDef = effect" ng-class="{'selected': $ctrl.selectedEffectDef === effect}">
                            <div class="effect-icon-wrapper">
                                <i ng-class="effect.icon"></i>
                            </div>
                            <div style="width: 100%;">
                                <div>{{effect.name}}</div>
                                <div class="muted" style="font-size: 13px;">{{effect.description}}</div>
                            </div>
                            <div class="effect-selected-wrapper">
                                <i class="fad fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="background:#43454A;display:flex;align-items: center;justify-content: space-between;padding: 20px;border-top: solid 2px #373C3E;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;">
                <div>
                    <div style="font-size: 12px;font-weight: 600;" class="muted">選択した演出:</div>
                    <div style="font-size: 20px;font-weight: 100;">{{$ctrl.selectedEffectDef ? $ctrl.selectedEffectDef.name : "なし"}}</div>
                </div>
                <div style="display:flex;align-items: center; justify-content: flex-end;">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()" style="margin-right: 10px;">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()" ng-disabled="$ctrl.selectedEffectDef == null">選択</button>
                </div>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(ngToast, backendCommunicator, utilityService, $scope, $timeout) {
            const $ctrl = this;

            $ctrl.activeCategory = null;
            $ctrl.categories = Object.values(EffectCategory);

            $ctrl.selectedEffectDef = null;

            $ctrl.effectDefs = [];
            $ctrl.$onInit = async function() {
                const effectDefs = await backendCommunicator
                    .fireEventAsync("getEffectDefinitions", {
                        triggerType: $ctrl.resolve.trigger,
                        triggerMeta: $ctrl.resolve.triggerMeta
                    });
                $ctrl.effectDefs = effectDefs
                    .sort((a, b) => {
                        const textA = a.name.toUpperCase();
                        const textB = b.name.toUpperCase();
                        return textA < textB ? -1 : textA > textB ? 1 : 0;
                    })
                    .filter(e => !e.hidden);

                if ($ctrl.resolve.selectedEffectTypeId) {
                    $ctrl.selectedEffectDef = $ctrl.effectDefs.find(e => e.id === $ctrl.resolve.selectedEffectTypeId);
                }

                if (!$ctrl.selectedEffectDef) {
                    const modalId = $ctrl.resolve.modalId;
                    utilityService.addSlidingModal(
                        $ctrl.modalInstance.rendered.then(() => {
                            const modalElement = $(`.${modalId}`).children();
                            return {
                                element: modalElement,
                                name: "演出を選択",
                                id: modalId,
                                instance: $ctrl.modalInstance
                            };
                        })
                    );

                    $scope.$on("modal.closing", function() {
                        utilityService.removeSlidingModal();
                    });
                }

                $timeout(() => {
                    angular.element("#effectSearch").trigger("focus");
                }, 50);
            };

            $ctrl.save = function() {
                if ($ctrl.selectedEffectDef == null) {
                    ngToast.create("演出を選んでください");
                    return;
                }

                $ctrl.close({
                    $value: {
                        selectedEffectDef: $ctrl.selectedEffectDef
                    }
                });
            };
        }
    });
}());
