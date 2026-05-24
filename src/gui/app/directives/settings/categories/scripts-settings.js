"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("scriptsSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="カスタムスクリプト"
                        description="Firebot はカスタムスクリプトをサポートしています。この機能は強力ですがリスクもあるため、使用前に有効化が必要です。信頼できる提供元のスクリプトのみ実行してください。"
                    >
                        <setting-description-addon>
                            <div style="margin-top: 10px;">独自スクリプトの作り方は <a
                                class="clickable"
                                ng-click="openLink('https://github.com/nmori/Firebot/wiki/Writing-Custom-Scripts')"
                            >こちら</a
                            > を参照してください。</div>
                        </setting-description-addon>
                        <toggle-button
                            toggle-model="settings.getSetting('RunCustomScripts')"
                            on-toggle="settings.saveSetting('RunCustomScripts', !settings.getSetting('RunCustomScripts'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="起動時スクリプト"
                        description="起動時スクリプトは Firebot 起動時に実行されるカスタムスクリプトです。新しいエフェクト、変数、イベントタイプを追加するスクリプトなどはここで読み込みます。"
                    >
                        <firebot-button
                            text="起動時スクリプトを管理"
                            disabled="!settings.getSetting('RunCustomScripts')"
                            ng-click="openStartupScriptsModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="カスタムスクリプトキャッシュをクリア"
                        description="スクリプト実行前にメモリ上のスクリプトキャッシュをクリアするかを設定します。スクリプト開発中は有効化すると変更が反映されやすくなります。通常利用では無効のままを推奨します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('ClearCustomScriptCache')"
                            on-toggle="settings.saveSetting('ClearCustomScriptCache', !settings.getSetting('ClearCustomScriptCache'))"
                            disabled="!settings.getSetting('RunCustomScripts')"
                            font-size="40"
                        />
                    </firebot-setting>


                </div>
          `,
            controller: function($rootScope, $scope, settingsService, utilityService) {
                $scope.openLink = $rootScope.openLinkExternally;
                $scope.settings = settingsService;

                $scope.openStartupScriptsModal = function() {
                    utilityService.showModal({
                        component: "startupScriptsListModal",
                        size: "sm",
                        backdrop: true,
                        keyboard: true
                    });
                };

            }
        });
}());
