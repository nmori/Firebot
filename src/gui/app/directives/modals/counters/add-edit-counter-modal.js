"use strict";

(function() {
    const uuidv1 = require("uuid/v4");
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
                    <h3>Name</h3>
                    <input type="text" class="form-control" placeholder="名前を入力" ng-model="$ctrl.counter.name">
                </div>

                <div class="counter-wrapper">
                    <div class="small-num clickable" ng-click="$ctrl.editMinimum()" aria-label="最低値を設定">
                        <div class="value" ng-show="$ctrl.counter.minimum != null">{{$ctrl.counter.minimum}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="not-set" ng-show="$ctrl.counter.minimum == null">(Not set)<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">最小値 <tooltip text="'このカウンタの最小値（任意）'"></tooltip></div>
                    </div>
                    <div class="bar"></div>
                    <div class="big-num clickable" ng-click="$ctrl.editCurrentValue()" aria-label="カウンターの現在値を編集">
                        <div class="value">{{$ctrl.counter.value}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">現在値</div>
                    </div>
                    <div class="bar"></div>
                    <div class="small-num clickable" ng-click="$ctrl.editMaximum()" aria-label="最大値を設定">
                        <div class="value" ng-show="$ctrl.counter.maximum != null">{{$ctrl.counter.maximum}}<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="not-set" ng-show="$ctrl.counter.maximum == null">(Not set)<span class="edit-icon"><i class="fas fa-edit"></i></span></div>
                        <div class="counter-title">最大値 <tooltip text="'このカウンタの最大値（任意）'"></tooltip></div>
                    </div>
                </div>

                <collapsable-panel header="これをどう使えばいい？">
                    <h3 class="use-title">使い方：</h3>
                    <p>- コマンドやボタンなどの<b>カウンタ更新</b>演出を使って、このカウンタを自動化します</p>
                    <p>- Access this counter's value with <b>$counter[{{$ctrl.counter.name}}]</b></p>
                    <p>- Every counter has an associated txt file with the value saved, you can add this txt file to your broadcasting software to display the value on your stream.</b></p>
                    <div><b>Txt file path for this counter:</b></div>
                    <div style="margin: 15px 0;">
                        <div class="input-group" style="width:75%;">
                            <input type="text" class="form-control" style="cursor:text;" ng-model="$ctrl.txtFilePath" disabled>
                            <span class="input-group-btn">
                                <button class="btn btn-default" type="button" ng-click="$ctrl.copyTxtFilePath()">Copy</button>
                            </span>
                        </div>
                    </div>
                </collapsable-panel>

                <div class="mt-12">
                    <h3>アップデート演出</h3>
                    <p>これらの演出は、<b>カウンターの更新</b>によってカウンターの値が更新されるたびに発生します。</h3>
                    ただし、値が最大値または最小値に達した場合は除きます。{{$ctrl.counter.minimum != null || $ctrl.counter.maximum != null ? ', except when the value hits the maximum or minimum' : ''}}.</p>
                    <effect-list header="What should this Counter do on every update?" effects="$ctrl.counter.updateEffects" trigger="counter" trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'update'}" update="$ctrl.updateEffectsListUpdated(effects)" modalId="{{$ctrl.modalId}}"></effect-list>
                </div>

                <div class="mt-12" ng-show="$ctrl.counter.minimum !== undefined && $ctrl.counter.minimum !== null">
                    <h3>最小値</h3>
                    <p>最小値に達したときに発火する。</p>
                    <effect-list header="カウンターが最小値に達したとき、このカウンターは何をすべきか？" effects="$ctrl.counter.minimumEffects" trigger="counter" trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'minimum'}" update="$ctrl.minimumEffectsListUpdated(effects)" modalId="{{$ctrl.modalId}}"></effect-list>
                </div>

                <div class="mt-12" ng-show="$ctrl.counter.maximum !== undefined && $ctrl.counter.maximum !== null">
                    <h3>最大値</h3>
                    <p>最大値に達したときに発火する。.</p>
                    <effect-list header="カウンターが最大値に達したとき、このカウンターは何をすべきでしょうか？" effects="$ctrl.counter.maximumEffects" trigger="counter" trigger-meta="{triggerId: $ctrl.counter.id,counterEffectListType: 'maximum'}" update="$ctrl.maximumEffectsListUpdated(effects)" modalId="{{$ctrl.modalId}}"></effect-list>
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
                    content: 'ファイルのパスをコピーしました'
                });
            };

            $ctrl.save = () => {
                if ($ctrl.counter.name == null || $ctrl.counter.name === "") {
                    ngToast.create("このカウンターの名前を入力してください");
                    return;
                }

                countersService.saveCounter($ctrl.counter).then(successful => {
                    if (successful) {
                        $ctrl.close({
                            $value: {
                                counter: $ctrl.counter
                            }
                        });
                    } else {
                        ngToast.create("Fカウンターの保存に失敗しました。再試行するか、ログで詳細を確認してください。");
                    }
                });
            };

            $ctrl.editMinimum = () => {
                utilityService.openGetInputModal(
                    {
                        model: $ctrl.counter.minimum,
                        inputType: "number",
                        label: "最小値の設定",
                        saveText: "保存する",
                        descriptionText: "このカウンターの最小値を設定（任意）",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value != null) {
                                if ($ctrl.counter.maximum != null && value >= $ctrl.counter.maximum) {
                                    return false;
                                }
                            }

                            return true;
                        },
                        validationText: `最小値は最大値を超えないでください (${$ctrl.counter.maximum}).`
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
                        label: "最大値の設定",
                        saveText: "保存する",
                        descriptionText: "このカウンターの最大値を設定（任意）",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value != null) {
                                if ($ctrl.counter.minimum != null && value <= $ctrl.counter.minimum) {
                                    return false;
                                }
                            }

                            return true;
                        },
                        validationText: `最大値は最低値を下回らないでください (${$ctrl.counter.minimum})`
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
                        label: "現在値の設定",
                        saveText: "保存する",
                        descriptionText: "このカウンターの現在値を設定",
                        inputPlaceholder: "数値を入力",
                        validationFn: async (value) => {
                            if (value == null) {
                                return {
                                    success: false,
                                    reason: `数値を入力してください`
                                };
                            }
                            if ($ctrl.counter.minimum != null && value < $ctrl.counter.minimum) {
                                return {
                                    success: false,
                                    reason: `現在値は最小値以上にしてください (${$ctrl.counter.minimum}).`
                                };
                            } else if ($ctrl.counter.maximum != null && value > $ctrl.counter.maximum) {
                                return {
                                    success: false,
                                    reason: `現在値は最小値以下にしてください (${$ctrl.counter.maximum}).`
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

                if ($ctrl.isNewCounter && $ctrl.counter.id == null) {
                    $ctrl.counter.id = uuidv1();
                }

                $ctrl.txtFilePath = countersService.getTxtFilePath($ctrl.counter.name);
            };
        }
    });
}());
