"use strict";

(function () {
    angular.module("firebotApp").component("advancedSettings", {
        template: `
                <div>

                    <firebot-setting
                        name="デバッグモード"
                        description="デバッグモードを有効にすると、ログファイルへより多くの情報が記録されます。原因不明の問題調査に役立ちます。"
                    >
                        <setting-description-addon>
                            <b>この設定変更を反映するには Firebot の再起動が必要です。</b>
                        </setting-description-addon>
                        <firebot-button
                            text="{{settings.getSetting('DebugMode') ? 'デバッグモードを無効化' : 'デバッグモードを有効化' }}"
                            ng-click="settings.saveSetting('DebugMode', !settings.getSetting('DebugMode'))"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="While ループ"
                        description="「Loop Effects」エフェクト内の条件付き「While Loop」オプションを有効/無効にします。"
                    >
                        <setting-description-addon>
                            <b>設定を誤ると無限ループにより Firebot がフリーズする可能性があります。</b>
                        </setting-description-addon>
                        <firebot-button
                            text="{{settings.getSetting('WhileLoopEnabled') ? 'While ループを無効化' : 'While ループを有効化' }}"
                            ng-click="toggleWhileLoops()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="グローバル値"
                        description="グローバル値はエフェクト内で $variable として使える固定値です。ここで作成・管理できます。"
                    >
                        <firebot-button
                            text="グローバル値を編集"
                            ng-click="showEditGlobalValuesModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="プロキシWebhook"
                        tag="Experimental"
                        description="ローカルネットワークを公開せずに Webhook を受信できる機能です。受信時に「Webhook Received」イベントが発火し、ペイロードは $webhookPayload で利用できます。"
                        bottom-border="false"
                    >
                        <setting-description-addon>
                            <b>この機能は実験的機能であり、安定動作は保証されません。</b>
                        </setting-description-addon>
                        <firebot-button
                            text="Webhookを編集"
                            ng-click="showEditWebhooksModal()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Webhookデバッグログ"
                        description="受信Webhookのログ記録を有効/無効にします。Webhookには機密情報が含まれる可能性があるため、ログ共有先に注意してください。"
                    >
                        <setting-description-addon>
                            <b>デバッグモードが有効な場合のみ利用できます。</b>
                        </setting-description-addon>
                        <firebot-button
                            text="{{settings.getSetting('WebhookDebugLogs') && settings.getSetting('DebugMode') ? 'Webhookログを無効化' : 'Webhookログを有効化' }}"
                            disabled="!settings.getSetting('DebugMode')"
                            ng-click="settings.saveSetting('WebhookDebugLogs', !settings.getSetting('WebhookDebugLogs'))"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="引用ID再計算"
                        description="Firebot の引用IDは固定です。途中の引用が削除されても番号は詰まりません。欠番をなくしたい場合はこの機能を使います。"
                    >
                        <setting-description-addon>
                            <b>念のため、先にバックアップを取得することを推奨します。</b>
                        </setting-description-addon>
                        <firebot-button
                            text="引用IDを再計算"
                            ng-click="recalculateQuoteIds()"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="引用のCSVエクスポートを許可"
                        description="プロフィールページで引用の「CSVとしてエクスポート」ボタンを表示するか設定します。"
                    >
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="allowQuoteCsv = settings.getSetting('AllowQuoteCSVDownloads')"
                            selected="allowQuoteCsv"
                            on-update="settings.saveSetting('AllowQuoteCSVDownloads', option === 'true')"
                            right-justify="true"
                            aria-label="プロフィールページの引用にCSVエクスポートボタンを表示するか選択"

                        />
                    </firebot-setting>

                    <firebot-setting
                        name="カスタム変数を永続化"
                        description="Firebot 終了時にすべてのカスタム変数をファイルへ保存するか設定します。"
                    >
                        <firebot-select
                            options="{ true: 'オン', false: 'オフ' }"
                            ng-init="persistVariables = settings.getSetting('PersistCustomVariables')"
                            selected="persistVariables"
                            on-update="settings.saveSetting('PersistCustomVariables', option === 'true')"
                            right-justify="true"
                            aria-label="カスタム変数の永続化を有効または無効にする"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="実験的クリッププレーヤー"
                        description="有効時、コンテンツ警告を回避する実験的手法でオーバーレイに Twitch クリップを再生します。動作保証はなく、失敗時は通常方式にフォールバックします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('UseExperimentalTwitchClipUrlResolver')"
                            on-toggle="settings.saveSetting('UseExperimentalTwitchClipUrlResolver', !settings.getSetting('UseExperimentalTwitchClipUrlResolver'))"
                            font-size="40"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="起動時にエフェクトキューモニターを開く"
                        description="Firebot 起動時にエフェクトキューモニターを自動で開きます。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('OpenEffectQueueMonitorOnLaunch')"
                            on-toggle="settings.saveSetting('OpenEffectQueueMonitorOnLaunch', !settings.getSetting('OpenEffectQueueMonitorOnLaunch'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('OpenEffectQueueMonitorOnLaunch') ? '有効' : '無効') + ' 起動時にエフェクトキューモニターを開く'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="チャット作成コマンドでエフェクト実行を許可"
                        description="!command システムコマンドで共有エフェクトを取り込み、コマンド応答内の変数経由でエフェクト実行を可能にします。高度機能のため、モデレーターを信頼できる場合のみ推奨します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('AllowChatCreatedCommandsToRunEffects')"
                            on-toggle="settings.saveSetting('AllowChatCreatedCommandsToRunEffects', !settings.getSetting('AllowChatCreatedCommandsToRunEffects'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('AllowChatCreatedCommandsToRunEffects') ? '有効' : '無効') + ' チャット作成コマンドでエフェクト実行を許可'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="既定のモデレーション実行ユーザー"
                        description="モデレーション操作を実行するユーザーアカウントを設定します。BAN/タイムアウト、メッセージ削除/クリア、チャットモード/シールドモード（Shield Mode）、Twitch シャウトアウトを含みます。"
                    >
                        <firebot-select
                            options="{ streamer: '配信者', bot: 'ボット' }"
                            ng-init="defaultModerationUser = settings.getSetting('DefaultModerationUser')"
                            selected="defaultModerationUser"
                            on-update="settings.saveSetting('DefaultModerationUser', option)"
                            right-justify="true"
                            aria-label="モデレーション操作を実行するユーザーアカウントを設定"
                        />

                        <setting-description-addon>
                            <strong>注: ボットアカウントが未ログインの場合、配信者アカウントで実行されます。</strong>
                        </setting-description-addon>
                    </firebot-setting>

                    <firebot-setting
                        name="プリセットエフェクトリスト再帰上限"
                        description="Firebot のハングを防ぐため、プリセットエフェクトリストが自分自身を再帰呼び出しできる回数を制限します。有効時は100回で停止します。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('PresetRecursionLimit')"
                            on-toggle="settings.saveSetting('PresetRecursionLimit', !settings.getSetting('PresetRecursionLimit'))"
                            font-size="40"
                            accessibility-label="(settings.getSetting('PresetRecursionLimit') ? '有効' : '無効') + ' プリセットエフェクトリスト再帰上限'"
                        />
                    </firebot-setting>

                    <firebot-setting
                        name="Firebot自動アップデート"
                        description="新しい安定版リリースが利用可能なときに Firebot の自動更新を有効/無効にします。"
                    >
                        <toggle-button
                            toggle-model="settings.getSetting('AutoUpdateLevel') !== 0"
                            on-toggle="toggleAutoUpdates()"
                            font-size="40"
                            accessibility-label="(settings.getSetting('AutoUpdateLevel') !== 0 ? '有効' : '無効') + ' Firebot自動アップデート'"
                        />

                        <setting-description-addon>
                            <strong>警告: このオプションを無効にすると、Firebot を最新に保つ責任は利用者側にあります。古いバージョンは公式サポート対象外です。詳細は <a href="https://github.com/crowbartools/Firebot/blob/master/.github/SUPPORT.md">サポートポリシー</a> を参照してください。</strong>
                        </setting-description-addon>
                    </firebot-setting>

                    <div style="margin-top: 20px">
                        <p class="muted">以前ここにあった設定をお探しですか？ ツールアプリメニューを確認してください。</p>
                    </div>

                </div>
          `,
        controller: function ($scope, settingsService, modalFactory, backendCommunicator, modalService) {
            $scope.settings = settingsService;

            $scope.toggleWhileLoops = () => {
                const whileLoopsEnabled = settingsService.getSetting("WhileLoopEnabled");

                if (whileLoopsEnabled) {
                    settingsService.saveSetting("WhileLoopEnabled", false);
                } else {
                    modalFactory
                        .showConfirmationModal({
                            title: "While ループを有効化",
                            question:
                                "この機能を有効化すると、While ループの誤使用によりパフォーマンス低下や Firebot フリーズが発生する可能性があることに同意しますか？",
                            confirmLabel: "理解しました。有効化します",
                            confirmBtnType: "btn-primary"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                settingsService.saveSetting("WhileLoopEnabled", true);
                            }
                        });
                }
            };

            $scope.showEditWebhooksModal = function () {
                modalService.showModal({
                    component: "editWebhooksModal"
                });
            };

            $scope.showEditGlobalValuesModal = function () {
                modalService.showModal({
                    component: "editGlobalValuesModal",
                    size: "sm"
                });
            };

            $scope.recalculateQuoteIds = () => {
                modalFactory
                    .showConfirmationModal({
                        title: "引用IDを再計算",
                        question: "引用IDを再計算してもよろしいですか？",
                        confirmLabel: "再計算する",
                        confirmBtnType: "btn-danger"
                    })
                    .then((confirmed) => {
                        if (confirmed) {
                            backendCommunicator.fireEvent("recalc-quote-ids");
                        }
                    });
            };

            $scope.toggleAutoUpdates = () => {
                if (settingsService.getSetting("AutoUpdateLevel") === 0) {
                    settingsService.saveSetting("AutoUpdateLevel", 2);
                } else {
                    modalFactory
                        .showConfirmationModal({
                            title: "自動アップデートを無効化しますか？",
                            question: "自動アップデートを無効化すると、更新作業はご自身で行う必要があり、サポート対象バージョンでない場合はサポートを受けられません。本当に Firebot の自動アップデートを無効化しますか？",
                            confirmLabel: "はい、無効化します",
                            confirmBtnType: "btn-danger",
                            cancelLabel: "いいえ、有効のままにします",
                            cancelBtnType: "btn-default"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                settingsService.saveSetting("AutoUpdateLevel", 0);
                            }
                        });
                }
            };
        }
    });
})();