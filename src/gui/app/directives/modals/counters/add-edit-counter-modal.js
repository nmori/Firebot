"use strict";

(function() {
    angular.module("firebotApp").component("addOrEditCounterModal", {
        template: `
            <context-menu-modal-header
                class="edit-preset-effect-list-header"
                on-close="$ctrl.dismiss()"
                trigger-type="counter"
                trigger-name="$ctrl.counter.name"
                sort-tags="$ctrl.counter.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>

            <div class="modal-body">
                <div>
                    <h3>名前</h3>
                    <input type="text" class="form-control" placeholder="名前を入力" ng-model="$ctrl.counter.name">
                </div>

                <div class="counter-wrapper">
                    <div class="small-num clickable" ng-click="$ctrl.editMinimum()" aria-label="最小値を編集">
                        <div class="value" ng-show="$ctrl.counter.minimum != null">{{$ctrl.counter.minimum}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="not-set" ng-show="$ctrl.counter.minimum == null">(未設定)<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">最小値 <tooltip text="'このカウンタに設定できる最小値（任意）'"></tooltip></div>
                    </div>
                    <div class="bar"></div>
                    <div class="big-num clickable" ng-click="$ctrl.editCurrentValue()" aria-label="現在値を編集">
                        <div class="value">{{$ctrl.counter.value}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">現在値</div>
                    </div>
                    <div class="bar"></div>
                    <div class="small-num clickable" ng-click="$ctrl.editMaximum()" aria-label="最大値を編集">
                        <div class="value" ng-show="$ctrl.counter.maximum != null">{{$ctrl.counter.maximum}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="not-set" ng-show="$ctrl.counter.maximum == null">(未設定)<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">最大値 <tooltip text="'このカウンタに設定できる最大値（任意）'"></tooltip></div>
                    </div>
                </div>

                <collapsable-panel header="使い方">
                    <h3 class="use-title">使い方:</h3>
                    <p>- コマンドやボタン等の <b>Update Counter</b> エフェクトでこのカウンタを自動更新できます。</p>
                    <p>- <b>$counter[{{$ctrl.counter.name}}]</b> でこのカウンタの値を参照できます。</p>
                    <p>- カウンタごとに値を保存する txt ファイルが作成されます。配信ソフトに読み込むことで配信画面に表示できます。</p>
                    <div><b>このカウンタの txt ファイルパス:</b></div>
                    <div style="margin: 15px 0;">
                        <div class="input-group" style="width:75%;">
                            <input type="text" class="form-control" style="cursor:text;" ng-model="$ctrl.txtFilePath" disabled>
                            <span class="input-group-btn">
                                <button class="btn btn-default" type="button" ng-click="$ctrl.copyTxtFilePath()">コピー</button>
                            </span>
                        </div>
                    </div>
                </collapsable-panel>

                <div class="mt-12">
                    <h3>更新時のエフェクト</h3>
                    <p>これらのエフェクトは <b>Update Counter</b> によりカウンタ値が更新されるたびに実行されます{{$ctrl.counter.minimum != null || $ctrl.counter.maximum != null ? '（ただし最小値または最大値に達した場合を除く）' : ''}}。</p>
                    <effect-list
                        header="カウンタ更新時に実行する内容"
                        effects="$ctrl.counter.updateEffects"
                        trigger="counter"
                        trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'update', rootEffects: $ctrl.counter.updateEffects}"
                        update="$ctrl.updateEffectsListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>

                <div class="mt-12" ng-show="$ctrl.counter.minimum !== undefined && $ctrl.counter.minimum !== null">
                    <h3>最小値到達時のエフェクト</h3>
                    <p>最小値に達したときに実行されます。</p>
                    <effect-list
                        header="最小値到達時に実行する内容"
                        effects="$ctrl.counter.minimumEffects"
                        trigger="counter"
                        trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'minimum', rootEffects: $ctrl.counter.minimumEffects}"
                        update="$ctrl.minimumEffectsListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>

                <div class="mt-12" ng-show="$ctrl.counter.maximum !== undefined && $ctrl.counter.maximum !== null">
                    <h3>最大値到達時のエフェクト</h3>
                    <p>最大値に達したときに実行されます。</p>
                    <effect-list
                        header="最大値到達時に実行する内容"
                        effects="$ctrl.counter.maximumEffects"
                        trigger="counter"
                        trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'maximum', rootEffects: $ctrl.counter.maximumEffects}"
                        update="$ctrl.maximumEffectsListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>
            </div>

            <div class="modal-footer sticky-footer edit-counter-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary add-new-board-save" ng-click="$ctrl.save()">保存</button>
            </div>
            <scroll-sentinel element-class="edit-counter-footer"></scroll-sentinel>
        `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function($rootScope, ngToast, countersService, utilityService) {
            const $ctrl = this;

            $ctrl.txtFilePath = "";
            $ctrl.isNewCounter = true;
            $ctrl.counter = {
                name: "",
                value: 0,
                saveToTxtFile: false,
                sortTags: []
            };

            $ctrl.copyTxtFilePath = () => {
                $rootScope.copyTextToClipboard($ctrl.txtFilePath);

                ngToast.create({
                    className: 'success',
                    content: 'カウンタの txt ファイルパスをコピーしました。'
                });
            };

            $ctrl.save = () => {
                if ($ctrl.counter.name == null || $ctrl.counter.name === "") {
                    ngToast.create("カウンタ名を入力してください。");
                    return;
                }

                const successful = countersService.saveCounter($ctrl.counter);
                if (successful) {
                    $ctrl.close({
                        $value: {
                            counter: $ctrl.counter
                        }
                    });
                } else {
                    ngToast.create("カウンタの保存に失敗しました。再試行するかログをご確認ください。");
                }
            };

            $ctrl.editMinimum = () => {
                utilityService.openGetInputModal(
                    {
                        model: $ctrl.counter.minimum,
                        inputType: "number",
                        label: "最小値を設定",
                        saveText: "保存",
                        descriptionText: "このカウンタの最小値を設定します（任意）。",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value != null) {
                                if ($ctrl.counter.maximum != null && value >= $ctrl.counter.maximum) {
                                    return false;
                                }
                            }

                            return true;
                        },
                        validationText: `最小値は最大値未満である必要があります (${$ctrl.counter.maximum})。`
                    },
                    (editedValue) => {
                        $ctrl.counter.minimum = editedValue;
                        if (editedValue != null && $ctrl.counter.value < $ctrl.counter.minimum) {
                            $ctrl.counter.value = $ctrl.counter.minimum;
                        }
                    }
                );
            };

            $ctrl.editMaximum = () => {
                utilityService.openGetInputModal(
                    {
                        model: $ctrl.counter.maximum,
                        inputType: "number",
                        label: "最大値を設定",
                        saveText: "保存",
                        descriptionText: "このカウンタの最大値を設定します（任意）。",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value != null) {
                                if ($ctrl.counter.minimum != null && value <= $ctrl.counter.minimum) {
                                    return false;
                                }
                            }

                            return true;
                        },
                        validationText: `最大値は最小値より大きい必要があります (${$ctrl.counter.minimum})。`
                    },
                    (editedValue) => {
                        $ctrl.counter.maximum = editedValue;
                        if (editedValue != null && $ctrl.counter.value > $ctrl.counter.maximum) {
                            $ctrl.counter.value = $ctrl.counter.maximum;
                        }
                    }
                );
            };

            $ctrl.editCurrentValue = () => {
                utilityService.openGetInputModal(
                    {
                        model: $ctrl.counter.value,
                        inputType: "number",
                        label: "現在値を設定",
                        saveText: "保存",
                        descriptionText: "このカウンタの現在値を更新します。",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value == null) {
                                return {
                                    success: false,
                                    reason: `カウンタ値は空にできません。`
                                };
                            }
                            if ($ctrl.counter.minimum != null && value < $ctrl.counter.minimum) {
                                return {
                                    success: false,
                                    reason: `カウンタ値は最小値未満にできません (${$ctrl.counter.minimum})。`
                                };
                            } else if ($ctrl.counter.maximum != null && value > $ctrl.counter.maximum) {
                                return {
                                    success: false,
                                    reason: `カウンタ値は最大値を超えられません (${$ctrl.counter.maximum})。`
                                };
                            }
                            return true;
                        }
                    },
                    (editedValue) => {
                        $ctrl.counter.value = editedValue;
                    }
                );
            };

            $ctrl.updateEffectsListUpdated = (effects) => {
                $ctrl.counter.updateEffects = effects;
            };
            $ctrl.maximumEffectsListUpdated = (effects) => {
                $ctrl.counter.maximumEffects = effects;
            };
            $ctrl.minimumEffectsListUpdated = (effects) => {
                $ctrl.counter.minimumEffects = effects;
            };

            $ctrl.$onInit = () => {
                if ($ctrl.resolve.counter) {
                    $ctrl.counter = JSON.parse(
                        angular.toJson($ctrl.resolve.counter)
                    );

                    if ($ctrl.counter.sortTags == null) {
                        $ctrl.counter.sortTags = [];
                    }

                    $ctrl.isNewCounter = false;
                }

                $ctrl.txtFilePath = countersService.getTxtFilePath($ctrl.counter.name);
            };
        }
    });
}());
