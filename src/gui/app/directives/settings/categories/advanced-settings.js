"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("advancedSettings", {
            template: `
                <div>

                    <firebot-setting 
                        name="開発者モード"
                        description="開発者モードを有効にすると、Firebotはログファイルに多くの情報を記録します。これは、不明な問題のトラブルシューティングを行う際に便利です"
                    >
                        <setting-description-addon>
                            <b
                                >この設定の変更を有効にするには、Firebotを再起動する必要があります。</b
                            >
                        </setting-description-addon>
                        <firebot-button 
                            text="{{settings.debugModeEnabled() ? '無効にする' : '有効にする' }}"
                            ng-click="settings.setDebugModeEnabled(!settings.debugModeEnabled())"
                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="無限ループ抑制"
                        description="演出の無限ループ抑制を有効または無効にする。"
                    >
                        <setting-description-addon>
                            <b
                                >気をつけないと、無限ループを引き起こし、Firebotをフリーズさせてしまうことがあります。</b
                            >
                        </setting-description-addon>
                        <firebot-button 
                            text="{{settings.getWhileLoopEnabled() ? '抑制する' : '抑制を解除' }}"
                            ng-click="toggleWhileLoops()"
                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="引用IDの再計算"
                        description="Firebotの引用IDは固定です。引用IDをつけ直して連続化させたい場合は、このオプションをご利用ください。"
                    >
                        <setting-description-addon>
                            <b
                                >念のため、最初にバックアップを取ることをお勧めします。</b
                            >
                        </setting-description-addon>
                        <firebot-button 
                            text="IDを付与し直す"
                            ng-click="recalculateQuoteIds()"
                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="引用文データの書き出しを許可"
                        description="プロフィールページで「CSVとしてエクスポート」ボタンを使用可能とするかどうか"
                    >
                        <firebot-select 
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="allowQuoteCsv = settings.getAllowQuoteCSVDownloads()"
                            selected="allowQuoteCsv" 
                            on-update="settings.setAllowQuoteCSVDownloads(option === 'true')"
                            right-justify="true"
                            aria-label="Choose Whether or not you want the 'Export as .CSV' button available for quotes on the profile page."

                        />
                    </firebot-setting>

                    <firebot-setting 
                        name="カスタム変数の永続化"
                        description="Firebot終了時にカスタム変数をファイルに保存し、次回起動時に維持するかどうか"
                    >
                        <firebot-select 
                            options="{ true: 'On', false: 'Off' }"
                            ng-init="persistVariables = settings.getPersistCustomVariables()"
                            selected="persistVariables" 
                            on-update="settings.setPersistCustomVariables(option === 'true')"
                            right-justify="true"
                            aria-label="enable or disabel persistent Custom Variables"
                        />
                    </firebot-setting>

                    <div style="margin-top: 20px">
                        <p class="muted">ここにあった設定をお探しですか？ツール→アプリのメニューで確認してみてください</p>
                    </div>

                </div>
          `,
            controller: function($scope, settingsService, utilityService, backendCommunicator) {
                $scope.settings = settingsService;

                $scope.toggleWhileLoops = () => {
                    const whileLoopsEnabled = settingsService.getWhileLoopEnabled();

                    if (whileLoopsEnabled) {
                        settingsService.setWhileLoopEnabled(false);
                    } else {
                        utilityService
                            .showConfirmationModal({
                                title: "無限ループ抑制の解除",
                                question: "この機能を有効にすることで、無限ループに陥った場合、パフォーマンスに問題が生じたり、Firebotがフリーズしたりする可能性があります。これを理解した上で制限を解除しますか",
                                confirmLabel: "わかった、抑制を解除する",
                                confirmBtnType: "btn-primary"
                            })
                            .then(confirmed => {
                                if (confirmed) {
                                    settingsService.setWhileLoopEnabled(true);
                                }
                            });
                    }
                };

                $scope.recalculateQuoteIds = () => {
                    utilityService
                        .showConfirmationModal({
                            title: "引用IDを振りなおす",
                            question: `番号を振り直してもよいですか？`,
                            confirmLabel: "振りなおす",
                            confirmBtnType: "btn-danger"
                        })
                        .then(confirmed => {
                            if (confirmed) {
                                backendCommunicator.fireEvent("recalc-quote-ids");
                            }
                        });
                };

            }
        });
}());
