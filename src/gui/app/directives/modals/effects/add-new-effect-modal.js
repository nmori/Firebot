"use strict";

const { EffectCategory } = require("../../shared/effect-constants");

(function() {
    angular.module("firebotApp").component("addNewEffectModal", {
        template: `
            <div class="select-effect-header modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">新しいエフェクトを選択</h4>
            </div>
            <div class="modal-body">
                <div class="select-effect-search">
                    <searchbar search-id="effectSearch" placeholder-text="エフェクトを検索..." query="$ctrl.effectSearch" style="width: 100%"></searchbar>
                </div>
                <div style="display: flex;flex-direction:row;height: 450px;">
                    <div class="select-effect-categories">
                        <div class="select-effect-category-header muted">カテゴリ</div>
                        <div class="select-effect-category" ng-class="{'selected': $ctrl.activeCategory == null}" ng-click="$ctrl.activeCategory = null;">
                            <div>すべて</div>
                        </div>
                        <div class="select-effect-category" ng-repeat="category in $ctrl.categories" ng-class="{'selected': $ctrl.activeCategory === category}" ng-click="$ctrl.activeCategory = category;">
                            <div>
                                {{category}}
                                <tooltip
                                    style="margin-left: 5px"
                                    ng-if="category === 'integrations'"
                                    text="'連携カテゴリのエフェクトを使用するには、設定 -> 連携 でリンク/設定が必要です。'"
                                ></tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="select-effect-list-container">
                        <div class="select-effect-def" ng-repeat="effect in $ctrl.effectDefs | effectCategoryFilter:$ctrl.activeCategory | filter:$ctrl.effectSearch track by effect.id" ng-click="$ctrl.selectedEffectDef = effect" ng-class="{'selected': $ctrl.selectedEffectDef === effect}">
                            <effect-icon effect-id="effect.id" effect-definition="effect"></effect-icon>
                            <div style="width: 100%;">
                                <div>{{effect.name}}</div>
                                <div class="muted" style="font-size: 13px;">{{effect.description}}</div>
                            </div>
                            <div class="select-effect-selected">
                                <i class="fad fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sticky-bottom-element select-effect-footer">
                <div>
                    <div style="font-size: 12px;font-weight: 600;" class="muted">選択中のエフェクト:</div>
                    <div style="font-size: 20px;font-weight: 100;">{{$ctrl.selectedEffectDef ? $ctrl.selectedEffectDef.name : "なし"}}</div>
                </div>
                <div class="flex">
                    <button type="button" class="btn btn-link mr-4" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()" ng-disabled="$ctrl.selectedEffectDef == null">選択</button>
                </div>
            </div>
            <scroll-sentinel element-class="select-effect-footer"></scroll-sentinel>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(ngToast, backendCommunicator, $timeout) {
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

                $timeout(() => {
                    angular.element("#effectSearch").trigger("focus");
                }, 50);
            };

            $ctrl.save = function() {
                if ($ctrl.selectedEffectDef == null) {
                    ngToast.create("エフェクトを選択してください！");
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
