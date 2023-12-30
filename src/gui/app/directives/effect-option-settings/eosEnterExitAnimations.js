"use strict";
(function() {
    //This adds the <eos-enter-exit-animations> element

    angular
        .module('firebotApp')
        .component("eosEnterExitAnimations", {
            bindings: {
                effect: '=',
                limitTo: '@',
                padTop: "<"
            },
            template: `
            <eos-container header="{{$ctrl.limitTo ? $ctrl.limitTo + ' アニメーション' : 'アニメーション'}}" pad-top="$ctrl.padTop">
                <div class="input-group" style="width: 100%" ng-hide="$ctrl.limitTo == 'Exit'">
                    <div class="fb-control-detail" ng-hide="$ctrl.limitTo != null">開始</div>
                    <select class="fb-select" ng-model="$ctrl.selected.enter" ng-change="$ctrl.enterUpdate()" ng-options="enter.name group by enter.category for enter in $ctrl.animations.enter"></select>
                    <div ng-hide="$ctrl.effect.enterAnimation === 'none'">
                        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 5px 0 15px 25px; align-items: center;">
                            <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> 任意の継続時間
                                <input type="checkbox" ng-init="customEnterDur = ($ctrl.effect.enterDuration != null && $ctrl.effect.enterDuration !== '')" ng-model="customEnterDur" ng-click="$ctrl.toggleEnterDurationStatus()">
                                <div class="control__indicator"></div>
                            </label>
                            <div ng-show="customEnterDur">
                                <form class="form-inline">
                                    <div class="form-group">
                                        <input type="number" class="form-control" ng-model="$ctrl.selected.enterDurationValue" ng-change="$ctrl.enterDurationUpdated()" style="width: 70px;">
                                    </div>
                                    <div class="form-group">
                                        <dropdown-select options="{s: '秒', ms: 'ミリ秒'}" selected="$ctrl.selected.enterDurationType" on-update="$ctrl.enterDurationUpdated(option)"></dropdown-select>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="input-group" style="width: 100%" ng-hide="$ctrl.limitTo == 'Exit'">
                    <div class="fb-control-detail" ng-hide="$ctrl.limitTo != null">間隔</div>
                    <select class="fb-select" ng-model="$ctrl.selected.inbetween" ng-change="$ctrl.inbetweenUpdate()" ng-options="inbetween.name for inbetween in $ctrl.animations.inbetween"></select>
                    <div ng-hide="$ctrl.effect.inbetweenAnimation === 'none'">
                        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 5px 0 0 25px; align-items: center;">
                            <span style="margin-right: 5px;width: 85px;">遅延時間 <tooltip text="'開始アニメーションの後、中間アニメーションを実行するまでの遅延時間'"></tooltip></span>
                            <div>
                                <form class="form-inline">
                                    <div class="form-group">
                                        <input type="number" class="form-control" ng-model="$ctrl.selected.inbetweenDelayValue" ng-change="$ctrl.inbetweenDelayUpdated()" style="width: 70px;">
                                    </div>
                                    <div class="form-group">
                                        <dropdown-select options="{s: '秒', ms: 'ミリ秒'}" selected="$ctrl.selected.inbetweenDelayType" on-update="$ctrl.inbetweenDelayUpdated(option)"></dropdown-select>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 5px 0 0 25px; align-items: center;">
                            <span style="margin-right: 5px;width: 85px;">繰り返し回数 <tooltip text="'何回繰り返すか。合計継続時間に達して終了アニメーションが始まると短縮される。'"></tooltip></span>
                            <div>
                                <form class="form-inline">
                                    <div class="form-group">
                                        <input type="number" class="form-control" ng-model="$ctrl.effect.inbetweenRepeat" ng-change="$ctrl.inbetweenRepeatUpdated()" style="width: 70px;">
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div ng-hide="$ctrl.effect.inbetweenAnimation === 'none'">
                        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 5px 0 15px 25px; align-items: center;">
                            <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> 任意の継続時間
                                <input type="checkbox" ng-init="customInbetweenDur = ($ctrl.effect.inbetweenDuration != null && $ctrl.effect.inbetweenDuration !== '')" ng-model="customInbetweenDur" ng-click="$ctrl.toggleInbetweenDurationStatus()">
                                <div class="control__indicator"></div>
                            </label>
                            <div ng-show="customInbetweenDur">
                                <form class="form-inline">
                                    <div class="form-group">
                                        <input type="number" class="form-control" ng-model="$ctrl.selected.inbetweenDurationValue" ng-change="$ctrl.inbetweenDurationUpdated()" style="width: 70px;">
                                    </div>
                                    <div class="form-group">
                                        <dropdown-select options="{s: '秒', ms: 'ミリ秒'}" selected="$ctrl.selected.inbetweenDurationType" on-update="$ctrl.inbetweenDurationUpdated(option)"></dropdown-select>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="input-group" style="width: 100%" ng-hide="$ctrl.limitTo == 'Enter'">
                    <div class="fb-control-detail" ng-hide="$ctrl.limitTo != null">終了</div>
                    <select class="fb-select" ng-model="$ctrl.selected.exit" ng-change="$ctrl.exitUpdate()" ng-options="exit.name group by exit.category for exit in $ctrl.animations.exit"></select>
                    <div ng-hide="$ctrl.effect.exitAnimation === 'none'">
                        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 5px 0 15px 25px; align-items: center;">
                            <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> 任意の継続時間
                                <input type="checkbox" ng-init="customExitDur = ($ctrl.effect.exitDuration != null && $ctrl.effect.exitDuration !== '')" ng-model="customExitDur" ng-click="$ctrl.toggleExitDurationStatus()">
                                <div class="control__indicator"></div>
                            </label>
                            <div ng-show="customExitDur">
                                <form class="form-inline">
                                    <div class="form-group">
                                        <input type="number" class="form-control" ng-model="$ctrl.selected.exitDurationValue" ng-change="$ctrl.exitDurationUpdated()" style="width: 70px;">
                                    </div>
                                    <div class="form-group">
                                        <dropdown-select options="{s: '秒', ms: 'ミリ秒'}" selected="$ctrl.selected.exitDurationType" on-update="$ctrl.exitDurationUpdated(option)"></dropdown-select>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </eos-container>
       `,
            controller: function() {
                const ctrl = this;
                ctrl.selected = {
                    enter: null,
                    enterDurationValue: 1,
                    enterDurationType: "s",
                    inbetween: null,
                    inbetweenDelayValue: 1,
                    inbetweenDelayType: "s",
                    inbetweenDurationValue: 1,
                    inbetweenDurationType: "s",
                    inbetweenRepeat: 1,
                    exit: null,
                    exitDurationValue: 1,
                    exitDurationType: "s"
                };

                function loadAnimationValues() {
                    ctrl.effect.enterAnimation = ctrl.effect.enterAnimation ? ctrl.effect.enterAnimation : 'フェードイン';
                    ctrl.selected.enter = ctrl.animations.enter.filter((ani) => {
                        return ani.class === ctrl.effect.enterAnimation;
                    })[0];

                    ctrl.effect.exitAnimation = ctrl.effect.exitAnimation ? ctrl.effect.exitAnimation : '・フェードアウト';
                    ctrl.selected.exit = ctrl.animations.exit.filter((ani) => {
                        return ani.class === ctrl.effect.exitAnimation;
                    })[0];

                    ctrl.effect.inbetweenAnimation = ctrl.effect.inbetweenAnimation ? ctrl.effect.inbetweenAnimation : 'なし';
                    ctrl.selected.inbetween = ctrl.animations.inbetween.filter((ani) => {
                        return ani.class === ctrl.effect.inbetweenAnimation;
                    })[0];

                    const enterDuration = ctrl.effect.enterDuration;
                    if (enterDuration != null) {
                        if (enterDuration.endsWith("ms")) {
                            ctrl.selected.enterDurationType = "ms";
                            ctrl.selected.enterDurationValue = parseFloat(enterDuration.replace("ms", ""));
                        } else if (enterDuration.endsWith("s")) {
                            ctrl.selected.enterDurationType = "s";
                            ctrl.selected.enterDurationValue = parseFloat(enterDuration.replace("s", ""));
                        }
                    }

                    const exitDuration = ctrl.effect.exitDuration;
                    if (exitDuration != null) {
                        if (exitDuration.endsWith("ms")) {
                            ctrl.selected.exitDurationType = "ms";
                            ctrl.selected.exitDurationValue = parseFloat(exitDuration.replace("ms", ""));
                        } else if (exitDuration.endsWith("s")) {
                            ctrl.selected.exitDurationType = "s";
                            ctrl.selected.exitDurationValue = parseFloat(exitDuration.replace("s", ""));
                        }
                    }

                    const inbetweenDuration = ctrl.effect.inbetweenDuration;
                    if (inbetweenDuration != null) {
                        if (inbetweenDuration.endsWith("ms")) {
                            ctrl.selected.inbetweenDurationType = "ms";
                            ctrl.selected.inbetweenDurationValue = parseFloat(inbetweenDuration.replace("ms", ""));
                        } else if (inbetweenDuration.endsWith("s")) {
                            ctrl.selected.inbetweenDurationType = "s";
                            ctrl.selected.inbetweenDurationValue = parseFloat(inbetweenDuration.replace("s", ""));
                        }
                    }

                    const inbetweenDelay = ctrl.effect.inbetweenDelay;
                    if (inbetweenDelay != null) {
                        if (inbetweenDelay.endsWith("ms")) {
                            ctrl.selected.inbetweenDelayType = "ms";
                            ctrl.selected.inbetweenDelayValue = parseFloat(inbetweenDelay.replace("ms", ""));
                        } else if (inbetweenDelay.endsWith("s")) {
                            ctrl.selected.inbetweenDelayType = "s";
                            ctrl.selected.inbetweenDelayValue = parseFloat(inbetweenDelay.replace("s", ""));
                        }
                    }

                }

                ctrl.$onInit = function() {
                    loadAnimationValues();
                };

                ctrl.$onChanges = function(changes) {
                    if (changes.effect) {
                        loadAnimationValues();
                    }
                };

                ctrl.toggleEnterDurationStatus = () => {
                    if (ctrl.effect.enterDuration) {
                        ctrl.effect.enterDuration = undefined;
                    } else {
                        ctrl.enterDurationUpdated();
                    }
                };

                ctrl.toggleExitDurationStatus = () => {
                    if (ctrl.effect.exitDuration) {
                        ctrl.effect.exitDuration = undefined;
                    } else {
                        ctrl.exitDurationUpdated();
                    }
                };

                ctrl.toggleInbetweenDurationStatus = () => {
                    if (ctrl.effect.inbetweenDuration) {
                        ctrl.effect.inbetweenDuration = undefined;
                    } else {
                        ctrl.inbetweenDurationUpdated();
                    }
                };

                ctrl.enterDurationUpdated = function() {
                    let durationValue = ctrl.selected.enterDurationValue;
                    if (durationValue == null || durationValue < 1) {
                        durationValue = 1;
                    }
                    ctrl.effect.enterDuration = `${ctrl.selected.enterDurationValue}${ctrl.selected.enterDurationType}`;
                };

                ctrl.exitDurationUpdated = function() {
                    let durationValue = ctrl.selected.exitDurationValue;
                    if (durationValue == null || durationValue < 1) {
                        durationValue = 1;
                    }
                    ctrl.effect.exitDuration = `${durationValue}${ctrl.selected.exitDurationType}`;
                };

                ctrl.inbetweenDurationUpdated = function() {
                    let durationValue = ctrl.selected.inbetweenDurationValue;
                    if (durationValue == null || durationValue < 1) {
                        durationValue = 1;
                    }
                    ctrl.effect.inbetweenDuration = `${durationValue}${ctrl.selected.inbetweenDurationType}`;
                };

                ctrl.inbetweenDelayUpdated = function() {
                    let delayValue = ctrl.selected.inbetweenDelayValue;
                    if (delayValue == null || delayValue < 0) {
                        delayValue = 0;
                    }
                    ctrl.effect.inbetweenDelay = `${delayValue}${ctrl.selected.inbetweenDelayType}`;
                };

                ctrl.inbetweenRepeatUpdated = function() {
                    let repeat = ctrl.effect.inbetweenRepeat;
                    if (repeat == null || repeat < 0) {
                        repeat = 0;
                    }
                    ctrl.effect.inbetweenRepeat = repeat;
                };

                ctrl.enterUpdate = function() {
                    ctrl.effect.enterAnimation = ctrl.selected.enter.class;
                };

                ctrl.exitUpdate = function() {
                    ctrl.effect.exitAnimation = ctrl.selected.exit.class;
                };

                ctrl.inbetweenUpdate = function() {
                    ctrl.effect.inbetweenAnimation = ctrl.selected.inbetween.class;
                };

                ctrl.animations = {
                    enter: [
                        {
                            name: "前後に跳ねる",
                            class: "bounceIn",
                            category: "Bouncing"
                        },
                        {
                            name: "上に跳ねる",
                            class: "bounceInUp",
                            category: "Bouncing"
                        },
                        {
                            name: "下に跳ねる",
                            class: "bounceInDown",
                            category: "Bouncing"
                        },
                        {
                            name: "左に跳ねる",
                            class: "bounceInLeft",
                            category: "Bouncing"
                        },
                        {
                            name: "右に跳ねる",
                            class: "bounceInRight",
                            category: "Bouncing"
                        },
                        {
                            name: "フェードイン",
                            class: "fadeIn",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（下、減速あり）",
                            class: "fadeInDown",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（下、減速なし）",
                            class: "fadeInDownBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（上、減速あり）",
                            class: "fadeInUp",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（上、減速なし）",
                            class: "fadeInUpBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（左、減速あり）",
                            class: "fadeInLeft",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（左、減速なし）",
                            class: "fadeInLeftBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（右、減速あり）",
                            class: "fadeInRight",
                            category: "Fade"
                        },
                        {
                            name: "フェードイン（右、減速なし）",
                            class: "fadeInRightBig",
                            category: "Fade"
                        },
                        {
                            name: "縦に回転",
                            class: "flipInX",
                            category: "Flip"
                        },
                        {
                            name: "横に回転",
                            class: "flipInY",
                            category: "Flip"
                        },
                        {
                            name: "時計回り",
                            class: "rotateIn",
                            category: "Rotate"
                        },
                        {
                            name: "左下に回転",
                            class: "rotateInDownLeft",
                            category: "Rotate"
                        },
                        {
                            name: "右下に回転",
                            class: "rotateInDownRight",
                            category: "Rotate"
                        },
                        {
                            name: "左上に回転",
                            class: "rotateInUpLeft",
                            category: "Rotate"
                        },
                        {
                            name: "右上に回転",
                            class: "rotateInUpRight",
                            category: "Rotate"
                        },
                        {
                            name: "ズームイン",
                            class: "zoomIn",
                            category: "Zoom"
                        },
                        {
                            name: "下にズームイン",
                            class: "zoomInDown",
                            category: "Zoom"
                        },
                        {
                            name: "左にズームイン",
                            class: "zoomInLeft",
                            category: "Zoom"
                        },
                        {
                            name: "右にズームイン",
                            class: "zoomInRight",
                            category: "Zoom"
                        },
                        {
                            name: "上にズームイン",
                            class: "zoomInUp",
                            category: "Zoom"
                        },
                        {
                            name: "下へスライド",
                            class: "slideInDown",
                            category: "Slide"
                        },
                        {
                            name: "左へスライド",
                            class: "slideInLeft",
                            category: "Slide"
                        },
                        {
                            name: "右へスライド",
                            class: "slideInRight",
                            category: "Slide"
                        },
                        {
                            name: "上へスライド",
                            class: "slideInUp",
                            category: "Slide"
                        },
                        {
                            name: "加速しながら入る",
                            class: "lightSpeedIn",
                            category: "Misc"
                        },
                        {
                            name: "びっくり箱",
                            class: "jackInTheBox",
                            category: "Misc"
                        },
                        {
                            name: "ころがる",
                            class: "rollIn",
                            category: "Misc"
                        },
                        {
                            name: "なし",
                            class: "none",
                            category: "Misc"
                        }
                    ],
                    exit: [
                        {
                            name: "前後に跳ねる",
                            class: "bounceOut",
                            category: "Bouncing"
                        },
                        {
                            name: "上に跳ねる",
                            class: "bounceOutUp",
                            category: "Bouncing"
                        },
                        {
                            name: "下に跳ねる",
                            class: "bounceOutDown",
                            category: "Bouncing"
                        },
                        {
                            name: "左に跳ねる",
                            class: "bounceOutLeft",
                            category: "Bouncing"
                        },
                        {
                            name: "右に跳ねる",
                            class: "bounceOutRight",
                            category: "Bouncing"
                        },
                        {
                            name: "フェードアウト",
                            class: "fadeOut",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（下、減速あり）",
                            class: "fadeOutDown",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（下、減速なし）",
                            class: "fadeOutDownBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（上、減速あり）",
                            class: "fadeOutUp",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（上、減速なし）",
                            class: "fadeOutUpBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（左、減速あり）",
                            class: "fadeOutLeft",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（左、減速なし）",
                            class: "fadeOutLeftBig",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（右、減速あり）",
                            class: "fadeOutRight",
                            category: "Fade"
                        },
                        {
                            name: "フェードアウト（右、減速なし）",
                            class: "fadeOutRightBig",
                            category: "Fade"
                        },
                        {
                            name: "時計回り",
                            class: "rotateOut",
                            category: "Rotate"
                        },
                        {
                            name: "左下に回転",
                            class: "rotateOutDownLeft",
                            category: "Rotate"
                        },
                        {
                            name: "右下に回転",
                            class: "rotateOutDownRight",
                            category: "Rotate"
                        },
                        {
                            name: "左上に回転",
                            class: "rotateOutUpLeft",
                            category: "Rotate"
                        },
                        {
                            name: "右上に回転",
                            class: "rotateOutUpRight",
                            category: "Rotate"
                        },
                        {
                            name: "ズームアウト",
                            class: "zoomOut",
                            category: "Zoom"
                        },
                        {
                            name: "下にズームアウト",
                            class: "zoomOutDown",
                            category: "Zoom"
                        },
                        {
                            name: "左にズームアウト",
                            class: "zoomOutLeft",
                            category: "Zoom"
                        },
                        {
                            name: "右にズームアウト",
                            class: "zoomOutRight",
                            category: "Zoom"
                        },
                        {
                            name: "上にズームアウト",
                            class: "zoomOutUp",
                            category: "Zoom"
                        },
                        {
                            name: "下へスライド",
                            class: "slideOutDown",
                            category: "Slide"
                        },
                        {
                            name: "左へスライド",
                            class: "slideOutLeft",
                            category: "Slide"
                        },
                        {
                            name: "右へスライド",
                            class: "slideOutRight",
                            category: "Slide"
                        },
                        {
                            name: "上へスライド",
                            class: "slideOutUp",
                            category: "Slide"
                        },
                        {
                            name: "加速しながら出る",
                            class: "lightSpeedOut",
                            category: "Misc"
                        },
                        {
                            name: "ヒンジ",
                            class: "hinge",
                            category: "Misc"
                        },
                        {
                            name: "ころがる",
                            class: "rollOut",
                            category: "Misc"
                        },
                        {
                            name: "なし",
                            class: "none",
                            category: "Misc"
                        }
                    ],
                    inbetween: [
                        {
                            name: "なし",
                            class: "none"
                        },
                        {
                            name: "跳ねる",
                            class: "bounce"
                        },
                        {
                            name: "光る",
                            class: "flash"
                        },
                        {
                            name: "点滅",
                            class: "pulse"
                        },
                        {
                            name: "シェイク",
                            class: "shake"
                        },
                        {
                            name: "スイング",
                            class: "swing"
                        },
                        {
                            name: "ジャジャーン",
                            class: "tada"
                        },
                        {
                            name: "ぐらぐら",
                            class: "wobble"
                        },
                        {
                            name: "ぷるぷる",
                            class: "jello"
                        }
                    ]
                };

            }
        });
}());
