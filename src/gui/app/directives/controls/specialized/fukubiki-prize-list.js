"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("fukubikiPrizeList", {
            bindings: {
                model: "="
            },
            template: `
                <div>
                    <div ng-if="$ctrl.model.length > 0">
                        <div class="muted" style="font-size:11px; margin-bottom:6px;">
                            合計重み: {{$ctrl.totalChance()}} &nbsp;|&nbsp;
                            <span ng-repeat="p in $ctrl.model">{{p.name}}: {{$ctrl.chancePercent(p)}}%<span ng-if="!$last"> / </span></span>
                        </div>
                    </div>
                    <div ng-repeat="prize in $ctrl.model track by prize.id" class="list-item selectable" ng-click="$ctrl.showAddOrEditModal(prize)">
                        <div uib-tooltip="クリックして編集" style="font-weight:400; width:100%;">
                            <div>
                                <b>{{prize.name}}</b>
                                &nbsp;
                                <span style="font-size:12px;">
                                    <span style="font-weight:600;"><i class="fas fa-dice"></i> 確率: {{$ctrl.chancePercent(prize)}}%</span>
                                    <span class="muted">
                                        &nbsp;|&nbsp;
                                        重み: {{prize.chance}}
                                        &nbsp;|&nbsp;
                                        ストック: {{prize.stock > 0 ? prize.stock + '個' : '無制限'}}
                                    </span>
                                </span>
                            </div>
                            <div class="muted" style="font-size:12px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                {{prize.message}}
                            </div>
                            <div class="muted" style="font-size:12px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" ng-if="prize.whisperMessage">
                                個別: {{prize.whisperMessage}}
                            </div>
                        </div>
                        <div class="flex items-center" style="column-gap:8px; flex-shrink:0;">
                            <span uib-tooltip="上へ" class="clickable" ng-show="!$first" ng-click="$ctrl.moveUp($index);$event.stopPropagation();" aria-label="上へ">
                                <i class="fas fa-arrow-up" style="color:#aaa;" aria-hidden="true"></i>
                            </span>
                            <span uib-tooltip="下へ" class="clickable" ng-show="!$last" ng-click="$ctrl.moveDown($index);$event.stopPropagation();" aria-label="下へ">
                                <i class="fas fa-arrow-down" style="color:#aaa;" aria-hidden="true"></i>
                            </span>
                            <span uib-tooltip="削除" class="clickable" style="color:#fb7373;" ng-click="$ctrl.removeAtIndex($index);$event.stopPropagation();" aria-label="賞を削除">
                                <i class="fad fa-trash-alt" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>

                    <p class="muted" ng-show="$ctrl.model.length === 0">賞が登録されていません。</p>

                    <div style="margin: 5px 0 10px 0;">
                        <button class="filter-bar" ng-click="$ctrl.showAddOrEditModal()" uib-tooltip="賞を追加" tooltip-append-to-body="true" aria-label="賞を追加">
                            <i class="far fa-plus"></i>
                        </button>
                    </div>
                </div>
            `,
            controller: function(utilityService) {
                const $ctrl = this;
                const { randomUUID } = require("crypto");

                $ctrl.$onInit = () => {
                    if ($ctrl.model == null) {
                        $ctrl.model = [];
                    }
                    // id が欠けている項目に補完（旧データ・デフォルト値の移行）
                    $ctrl.model.forEach((p) => {
                        if (!p.id) {
                            p.id = randomUUID();
                        }
                    });
                };

                $ctrl.totalChance = () => {
                    return ($ctrl.model || []).reduce((sum, p) => sum + (p.chance || 0), 0);
                };

                $ctrl.chancePercent = (prize) => {
                    const total = $ctrl.totalChance();
                    if (total === 0) return "0.0";
                    return ((prize.chance / total) * 100).toFixed(1);
                };

                $ctrl.showAddOrEditModal = (prize) => {
                    utilityService.showModal({
                        component: "addOrEditFukubikiPrizeModal",
                        size: "sm",
                        resolveObj: {
                            prize: () => prize,
                            allPrizes: () => $ctrl.model
                        },
                        closeCallback: (savedPrize) => {
                            const idx = $ctrl.model.findIndex(p => p.id === savedPrize.id);
                            if (idx >= 0) {
                                $ctrl.model[idx] = savedPrize;
                            } else {
                                $ctrl.model.push(savedPrize);
                            }
                        }
                    });
                };

                $ctrl.removeAtIndex = (index) => {
                    $ctrl.model.splice(index, 1);
                };

                $ctrl.moveUp = (index) => {
                    if (index <= 0) return;
                    const tmp = $ctrl.model[index - 1];
                    $ctrl.model[index - 1] = $ctrl.model[index];
                    $ctrl.model[index] = tmp;
                };

                $ctrl.moveDown = (index) => {
                    if (index >= $ctrl.model.length - 1) return;
                    const tmp = $ctrl.model[index + 1];
                    $ctrl.model[index + 1] = $ctrl.model[index];
                    $ctrl.model[index] = tmp;
                };
            }
        });
}());
