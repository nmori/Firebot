"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("scriptsSettings", {
            template: `
                <div>

                    <firebot-setting
                        name="カスタムスクリプト"
                        description="Firebotはカスタムスクリプトをサポートしています！この機能を使用するにはあなたの許可が必要です。スクリプトは自由度が高くリスクもあるため、信頼できる入手先から物のみ実行してください。"
                    >
                        <setting-description-addon>
                            <div style="margin-top: 10px;">どのようにスクリプトを作ればよいですか? 今すぐ学ぶ <a
                                class="clickable"
                                ng-click="openLink('https://github.com/crowbartools/Firebot/wiki/Writing-Custom-Scripts')"
                            >here</a
                            >.</div>
                        </setting-description-addon>
                        <firebot-select
                            options="{ true: '有効', false: '無効' }"
                            ng-init="customScriptsEnabled = settings.getCustomScriptsEnabled()"
                            selected="customScriptsEnabled"
                            on-update="settings.setCustomScriptsEnabled(option === 'true')"
                            right-justify="true"
                            aria-label="Enable or disable custom scripts"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="起動時スクリプト"
                        description="起動時スクリプトは、Firebotの起動時に実行されるカスタムスクリプトです。新しい演出、変数、イベントタイプなどを追加するスクリプトはここで読み込みます。"
                    >
                        <firebot-button
                            text="起動時スクリプトを管理"
                            disabled="!settings.getCustomScriptsEnabled()"
                            ng-click="openStartupScriptsModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="スクリプトキャッシュをクリア"
                        description="スクリプトを実行する前にメモリからクリアするかどうかを設定します。これを有効にすると、スクリプトを積極的に開発する場合に便利です。そうしないと、Firebotが再起動するまでスクリプトの変更が反映されません。普段は無効にしておいてください。"
                    >
                        <firebot-select
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="clearCache = settings.getClearCustomScriptCache()"
                            is-disabled="!settings.getCustomScriptsEnabled()"
                            selected="clearCache"
                            on-update="settings.setClearCustomScriptCache(option === 'true')"
                            right-justify="true"
                            aria-label="Enable or disable the Clearing of Custom Script Cache"
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
