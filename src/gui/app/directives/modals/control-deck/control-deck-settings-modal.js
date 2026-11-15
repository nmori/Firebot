"use strict";

(function() {
    angular.module("firebotApp").component("controlDeckSettingsModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">コントロールデッキの設定</h4>
            </div>
            <div class="modal-body">
                <div class="form-group flex-row jspacebetween mb-0">
                    <div>
                        <label class="control-label" style="margin:0;font-size: 18px;">コントロールデッキを有効にする</label>
                        <p class="help-block pr-8">有効にすると、ローカルネットワーク上のスマートフォンやタブレットからコントロールデッキのページを開けるようになります。</p>
                    </div>
                    <div>
                        <toggle-button toggle-model="$ctrl.settings.enabled" auto-update-value="true" font-size="40"></toggle-button>
                    </div>
                </div>

                <h4 style="margin-top: 20px;">PIN <span class="muted" style="font-weight: 400;">（任意）</span></h4>
                <p class="muted">ページを開いたりボタンを押したりする際にこの PIN を要求します。PIN を使わない場合は空欄にしてください。</p>
                <input type="text" class="form-control" style="max-width: 220px;" ng-model="$ctrl.settings.pin" placeholder="PINなし">

                <h4 style="margin-top: 20px;">画面の向き</h4>
                <firebot-radio-cards
                    options="$ctrl.orientationOptions"
                    ng-model="$ctrl.settings.orientationMode"
                    grid-columns="2"
                ></firebot-radio-cards>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
        `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function(settingsService) {
            const $ctrl = this;

            $ctrl.settings = {
                enabled: false,
                pin: "",
                orientationMode: "dynamic"
            };

            $ctrl.orientationOptions = [
                {
                    value: "dynamic",
                    label: "自動",
                    description: "画面に最適に収まるようにグリッドが回転します",
                    iconClass: "fa-sync"
                },
                {
                    value: "fixed",
                    label: "固定",
                    description: "デバイスの向きに関係なく、設計したレイアウトを維持します",
                    iconClass: "fa-lock"
                }
            ];

            $ctrl.$onInit = () => {
                $ctrl.settings.enabled = settingsService.getSetting("ControlDeckEnabled");
                $ctrl.settings.pin = settingsService.getSetting("ControlDeckPin") || "";
                $ctrl.settings.orientationMode = settingsService.getSetting("ControlDeckOrientationMode");
            };

            $ctrl.save = () => {
                settingsService.saveSetting("ControlDeckEnabled", $ctrl.settings.enabled === true);
                settingsService.saveSetting("ControlDeckPin", $ctrl.settings.pin || "");
                settingsService.saveSetting("ControlDeckOrientationMode", $ctrl.settings.orientationMode || "dynamic");
                $ctrl.close();
            };
        }
    });
}());
