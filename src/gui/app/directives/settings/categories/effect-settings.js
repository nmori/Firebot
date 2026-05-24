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
                        <toggle-button
                            toggle-model="settings.getSetting('DefaultEffectLabelsEnabled')"
                            on-toggle="settings.saveSetting('DefaultEffectLabelsEnabled', !settings.getSetting('DefaultEffectLabelsEnabled'))"
                            font-size="40"
                        />
                    </firebot-setting>
                </div>
          `,
            controller: function ($scope, settingsService) {
                $scope.settings = settingsService;
            }
        });
}());
