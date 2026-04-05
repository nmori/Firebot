"use strict";

(function() {
    angular.module("firebotApp").component("hotkeyCapture", {
        bindings: {
            onCapture: "&",
            hotkey: "<"
        },
        template: `
                <div class="hotkey-capture" ng-class="{ 'capturing': $ctrl.hks.isCapturingHotkey, 'has-value': $ctrl.hotkeyDisplay && $ctrl.hotkeyDisplay.length > 0 }">
                    <div class="hotkey-display"
                          ng-keydown="$ctrl.handleKeydown($event)"
                          aria-label="{{ $ctrl.hks.isCapturingHotkey ? 'キーの組み合わせを入力してください。' : ($ctrl.hotkeyDisplay ? '現在のホットキー: ' + $ctrl.hotkeyDisplay + '。' : '記録をクリックしてホットキーを設定') }}">
                        <div class="hotkey-content">
                            <i class="fas fa-keyboard" style="margin-right: 8px; opacity: 0.7;"></i>
                            <span ng-if="$ctrl.hotkeyDisplay == null || $ctrl.hotkeyDisplay === ''" class="muted" style="font-weight: 500;">
                                {{ $ctrl.hks.isCapturingHotkey ? 'キーの組み合わせを入力...' : 'キーバインド未設定' }}
                            </span>
                            <span class="hotkey-value">{{$ctrl.hotkeyDisplay}}</span>
                        </div>
                        <button ng-click="$ctrl.recordKeys(); $event.stopPropagation()"
                                class="hotkey-chip-btn"
                                ng-class="$ctrl.hks.isCapturingHotkey ? 'recording' : 'idle'"
                                aria-label="{{ $ctrl.hks.isCapturingHotkey ? 'ホットキー記録を停止' : 'ホットキー記録を開始' }}">
                            <i class="fas" ng-class="$ctrl.hks.isCapturingHotkey ? 'fa-stop' : 'fa-dot-circle'"></i>
                            <span>{{$ctrl.hks.isCapturingHotkey ? '停止' : ($ctrl.hotkeyDisplay ? 'キーバインドを編集' : 'キーバインドを記録')}}</span>
                        </button>
                    </div>
                </div>
            `,
        controller: function(hotkeyService, $rootScope, $scope) {
            const $ctrl = this;

            $ctrl.hks = hotkeyService;

            $ctrl.recordKeys = function() {
                if (hotkeyService.isCapturingHotkey) {
                    // If already capturing, stop it
                    hotkeyService.stopHotkeyCapture();
                } else {
                    // Start capturing
                    hotkeyService.startHotkeyCapture((hotkey) => {
                        $ctrl.onCapture({ hotkey: hotkey });
                        $scope.$applyAsync();
                    });
                }
            };

            // Handle keyboard navigation on the display
            $ctrl.handleKeydown = function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    $ctrl.recordKeys();
                }
            };

            $ctrl.$onChanges = function(changes) {
                $ctrl.hotkeyDisplay = hotkeyService.getDisplayFromAcceleratorCode(
                    changes.hotkey.currentValue
                );
            };

            $ctrl.$onInit = function() {
                $ctrl.hotkeyDisplay = hotkeyService.getDisplayFromAcceleratorCode(
                    $ctrl.hotkey
                );
            };

            $rootScope.$on("hotkey:capture:update", (event, data) => {
                $ctrl.hotkeyDisplay = hotkeyService.getDisplayFromAcceleratorCode(
                    data.hotkey
                );

                $scope.$applyAsync();
            });
        }
    });
}());
