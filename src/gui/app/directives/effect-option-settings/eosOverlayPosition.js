"use strict";

(function() {
    //This adds the <eos-overlay-instance> element

    angular
        .module('firebotApp')
        .component("eosOverlayPosition", {
            bindings: {
                effect: '=',
                hideRandom: "<",
                padTop: "<"
            },
            template: `
            <eos-container header="オーバーレイ表示位置" pad-top="$ctrl.padTop">
                <div class="controls-fb-inline">
                    <label class="control-fb control--radio">プリセット
                        <input type="radio" ng-model="$ctrl.presetOrCustom" ng-change="$ctrl.togglePresetCustom()" value="preset"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">カスタム
                        <input type="radio" ng-model="$ctrl.presetOrCustom" ng-change="$ctrl.togglePresetCustom()" value="custom"/>
                        <div class="control__indicator"></div>
                    </label>
                </div>
                <div ng-if="$ctrl.effect.position !== 'Custom'">
                    <div class="btn-group btn-matrix" style="margin: 5px 0 5px 0px;">
                        <label ng-repeat="position in $ctrl.presetPositions" class="btn btn-primary" ng-model="$ctrl.anchorPosition" ng-change="$ctrl.onMatrixChange()" ng-disabled="$ctrl.randomMode === 'both'" uib-btn-radio="position" uib-tooltip="{{position}}" tooltip-append-to-body="true" tooltip-animation="false"></label>
                    </div>
                    <div class="controls-fb-inline" ng-if="!$ctrl.hideRandom">
                        <label class="control-fb control--checkbox" style="margin: 5px 0 0 10px;"> プリセット位置をランダムにする
                            <input type="checkbox" ng-click="$ctrl.toggleRandomPreset()" ng-checked="$ctrl.isRandom()">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                    <div ng-if="!$ctrl.hideRandom && $ctrl.isRandom()" style="margin: 4px 0 0 36px;">
                        <div class="controls-fb-inline" style="row-gap:4px;">
                            <label class="control-fb control--radio">両軸ランダム
                                <input type="radio" ng-model="$ctrl.randomMode" ng-change="$ctrl.onRandomModeChange()" value="both"/>
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--radio">X軸のみ（左右がランダム）
                                <input type="radio" ng-model="$ctrl.randomMode" ng-change="$ctrl.onRandomModeChange()" value="x"/>
                                <div class="control__indicator"></div>
                            </label>
                            <label class="control-fb control--radio">Y軸のみ（上下がランダム）
                                <input type="radio" ng-model="$ctrl.randomMode" ng-change="$ctrl.onRandomModeChange()" value="y"/>
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                        <p class="muted" style="font-size:11px; margin-top:4px;" ng-if="$ctrl.randomMode === 'x'">上の3×3でクリックした「行」が固定されます。クリックした列は無視されます。</p>
                        <p class="muted" style="font-size:11px; margin-top:4px;" ng-if="$ctrl.randomMode === 'y'">上の3×3でクリックした「列」が固定されます。クリックした行は無視されます。</p>
                    </div>
                </div>
                <div ng-if="$ctrl.effect.position === 'Custom'" style="margin: 5px 0 5px 0px;">
                    <form class="form-inline">
                        <div class="form-group">
                            <input type="number" class="form-control" ng-model="$ctrl.topOrBottomValue" ng-change="$ctrl.updateAllValues()" style="width: 85px;">
                        </div>
                        <div class="form-group">
                            <span> px を </span>
                            <dropdown-select options="['top','bottom']" selected="$ctrl.topOrBottom" on-update="$ctrl.updateTopOrBottom(option)"></dropdown-select>
                            <span> から</span>
                        </div>
                        <div style="margin-top: 15px;">
                            <div class="form-group">
                                <input type="number" class="form-control" ng-model="$ctrl.leftOrRightValue" ng-change="$ctrl.updateAllValues()" style="width: 85px;">
                            </div>
                            <div class="form-group">
                                <span> px を </span>
                                <dropdown-select options="['left','right']" selected="$ctrl.leftOrRight" on-update="$ctrl.updateLeftOrRight(option)"></dropdown-select>
                                <span> から</span>
                            </div>
                        </div>
                    </form>
                </div>
                <div style="margin-top: 15px;">
                    <div class="input-group">
                        <span class="input-group-addon">z-index <tooltip text="'重なったときに前面に表示される順序を制御します。数値が大きいほど前面に表示されます。'"></tooltip></span>
                        <input
                            type="text"
                            class="form-control"
                            placeholder="任意"
                            replace-variables="number"
                            ng-model="$ctrl.effect.zIndex">
                    </div>
                </div>
            </eos-container>
       `,
            controller: function() {
                const ctrl = this;

                ctrl.topOrBottom = "top";
                ctrl.topOrBottomValue = 0;
                ctrl.leftOrRight = "left";
                ctrl.leftOrRightValue = 0;

                // 「アンカー」となる3×3マトリクスでの選択値（"Top Left"〜"Bottom Right"／"Middle"）。
                // ランダムモード時はここから X 行 / Y 列を取り出して effect.position に変換する。
                ctrl.anchorPosition = "Middle";

                // "off" | "both" | "x" | "y"
                ctrl.randomMode = "off";

                const RANDOM_X_VALUES = ["Top Random", "Middle Random", "Bottom Random"];
                const RANDOM_Y_VALUES = ["Random Left", "Random Middle", "Random Right"];

                ctrl.updateTopOrBottom = function(option) {
                    ctrl.topOrBottom = option;
                    ctrl.updateAllValues();
                };

                ctrl.updateLeftOrRight = function(option) {
                    ctrl.leftOrRight = option;
                    ctrl.updateAllValues();
                };

                function parseYRow(pos) {
                    if (!pos || pos === "Random" || pos === "Custom") {
                        return null;
                    }
                    if (pos === "Middle") {
                        return "Middle";
                    }
                    const head = pos.split(" ")[0];
                    if (head === "Top" || head === "Middle" || head === "Bottom") {
                        return head;
                    }
                    return null;
                }

                function parseXCol(pos) {
                    if (!pos || pos === "Random" || pos === "Custom") {
                        return null;
                    }
                    if (pos === "Middle") {
                        return "Middle";
                    }
                    const parts = pos.split(" ");
                    const tail = parts[parts.length - 1];
                    if (tail === "Left" || tail === "Middle" || tail === "Right") {
                        return tail;
                    }
                    return null;
                }

                function combinePosition(yRow, xCol) {
                    if (yRow === "Middle" && xCol === "Middle") {
                        return "Middle";
                    }
                    return `${yRow} ${xCol}`;
                }

                ctrl.applyAnchorAndMode = function() {
                    const yRow = parseYRow(ctrl.anchorPosition) || "Middle";
                    const xCol = parseXCol(ctrl.anchorPosition) || "Middle";
                    if (ctrl.randomMode === "both") {
                        ctrl.effect.position = "Random";
                    } else if (ctrl.randomMode === "x") {
                        ctrl.effect.position = `${yRow} Random`;
                    } else if (ctrl.randomMode === "y") {
                        ctrl.effect.position = `Random ${xCol}`;
                    } else {
                        ctrl.effect.position = combinePosition(yRow, xCol);
                    }
                };

                ctrl.onMatrixChange = function() {
                    ctrl.applyAnchorAndMode();
                };

                ctrl.onRandomModeChange = function() {
                    ctrl.applyAnchorAndMode();
                };

                ctrl.isRandom = function() {
                    return ctrl.randomMode !== "off";
                };

                ctrl.toggleRandomPreset = function() {
                    if (ctrl.isRandom()) {
                        ctrl.randomMode = "off";
                    } else {
                        ctrl.randomMode = "both";
                    }
                    ctrl.applyAnchorAndMode();
                };

                ctrl.updateAllValues = function() {
                    if (ctrl.topOrBottom === "top") {
                        ctrl.effect.customCoords.top = ctrl.topOrBottomValue;
                        ctrl.effect.customCoords.bottom = null;
                    } else {
                        ctrl.effect.customCoords.top = null;
                        ctrl.effect.customCoords.bottom = ctrl.topOrBottomValue;
                    }

                    if (ctrl.leftOrRight === "left") {
                        ctrl.effect.customCoords.left = ctrl.leftOrRightValue;
                        ctrl.effect.customCoords.right = null;
                    } else {
                        ctrl.effect.customCoords.left = null;
                        ctrl.effect.customCoords.right = ctrl.leftOrRightValue;
                    }
                };

                ctrl.togglePresetCustom = function() {
                    if (ctrl.presetOrCustom === "custom") {
                        ctrl.randomMode = "off";
                        ctrl.effect.position = "Custom";
                    } else {
                        ctrl.anchorPosition = "Middle";
                        ctrl.randomMode = "off";
                        ctrl.applyAnchorAndMode();
                    }
                };

                ctrl.presetPositions = [
                    "Top Left",
                    "Top Middle",
                    "Top Right",
                    "Middle Left",
                    "Middle",
                    "Middle Right",
                    "Bottom Left",
                    "Bottom Middle",
                    "Bottom Right"
                ];

                ctrl.$onInit = function() {
                    if (ctrl.effect.position == null) {
                        ctrl.effect.position = "Middle";
                    }
                    if (ctrl.effect.customCoords == null) {
                        ctrl.effect.customCoords = {
                            top: 0,
                            bottom: null,
                            left: 0,
                            right: null
                        };
                    } else {
                        if (ctrl.effect.customCoords.top != null) {
                            ctrl.topOrBottom = "top";
                            ctrl.topOrBottomValue = ctrl.effect.customCoords.top;
                        } else {
                            ctrl.topOrBottom = "bottom";
                            ctrl.topOrBottomValue = ctrl.effect.customCoords.bottom;
                        }
                        if (ctrl.effect.customCoords.left != null) {
                            ctrl.leftOrRight = "left";
                            ctrl.leftOrRightValue = ctrl.effect.customCoords.left;
                        } else {
                            ctrl.leftOrRight = "right";
                            ctrl.leftOrRightValue = ctrl.effect.customCoords.right;
                        }
                    }
                    ctrl.presetOrCustom =
                        ctrl.effect.position === "Custom" ? "custom" : "preset";

                    // 保存済み effect.position から anchorPosition と randomMode を復元する
                    const pos = ctrl.effect.position;
                    if (pos === "Random") {
                        ctrl.randomMode = "both";
                        ctrl.anchorPosition = "Middle";
                    } else if (RANDOM_X_VALUES.indexOf(pos) >= 0) {
                        ctrl.randomMode = "x";
                        const yRow = pos.split(" ")[0];
                        ctrl.anchorPosition = combinePosition(yRow, "Middle");
                    } else if (RANDOM_Y_VALUES.indexOf(pos) >= 0) {
                        ctrl.randomMode = "y";
                        const xCol = pos.split(" ")[1];
                        ctrl.anchorPosition = combinePosition("Middle", xCol);
                    } else if (pos === "Custom") {
                        ctrl.randomMode = "off";
                        ctrl.anchorPosition = "Middle";
                    } else {
                        ctrl.randomMode = "off";
                        ctrl.anchorPosition = pos;
                    }
                };
            }
        });
}());
