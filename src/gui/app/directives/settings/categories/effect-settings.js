"use strict";

(function () {

    angular
        .module("firebotApp")
        .component("effectSettings", {
            template: `
                <div>
                    <firebot-setting
                        name="演出のラベル名（初期設定）"
                        description="有効にすると、カスタムラベルが設定されていない（ほとんどの）演出のラベルをFirebotが自動生成します。"
                    >
                        <firebot-select
                            options="{ true: 'On', false: 'Off' }"
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
