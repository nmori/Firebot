"use strict";

(function () {

    angular
        .module("firebotApp")
        .component("effectSettings", {
            template: `
                <div>
                    <firebot-setting
                        name="デフォルトのエフェクトラベル"
                        description="有効時、カスタムラベル未設定の（ほとんどの）エフェクトに対して Firebot が自動でラベルを生成します。"
                    >
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="effectLabelsEnabled = settings.getSetting('DefaultEffectLabelsEnabled')"
                            selected="effectLabelsEnabled"
                            on-update="settings.saveSetting('DefaultEffectLabelsEnabled', option === 'true')"
                            right-justify="true"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function ($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
