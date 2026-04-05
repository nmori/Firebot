"use strict";

(function() {
    angular.module("firebotApp").component("setupWizardModal", {
        template: `
        <div class="modal-header" style="text-align:center">
            <h3>{{$ctrl.getStepTitle()}}</h3>
        </div>
            <div class="modal-body" style="text-align:center">

                <div ng-switch="$ctrl.getCurrentStep()" class="slide-frame">

                    <div ng-switch-when="0" class="wave">
                        <div class="welcome-wrapper">
                            <h3 class="animated fadeIn">ようこそ</h3>
                            <img style="animation-delay: 0.5s" class="animated rollIn" src="../images/logo_transparent.png">
                            <span style="animation-delay: 1.3s" class="animated bounceIn firebot-wordmark ml-5">Firebot</span>
                        </div>
                        <div style="animation-delay: 2.0s" class="animated fadeIn welcome-subtitle">
                            <span>Twitch 配信者向けツール</span>
                        </div>
                        <div style="animation-delay: 3.2s" class="animated fadeInUp">
                            <a class="btn btn-info hvr-icon-forward" ng-click="$ctrl.handleNext()">はじめる <i class="fas fa-arrow-right hvr-icon"></i></a>
                        </div>
                    </div>

                    <div ng-switch-when="1" class="wave">
                        <p>
                            Firebot は2種類のアカウントに対応しています:</br></br>
                            <b>配信者</b> - 配信に使用するアカウント <span class="muted">（必須）</span></br>
                            <b>Bot</b> - 視聴者とチャットできるサブアカウント <span class="muted">（任意）</span>
                        </p>
                        <div class="wizard-accounts-wrapper">
                            <div class="wizard-accounts-title">
                                アカウント
                            </div>
                            <table class="table">
                            <tbody>
                                <tr style="border-top: 2px solid #ddd;">
                                        <td class="wizard-accounts-td text-left">
                                            <b ng-show="$ctrl.cs.accounts.streamer.loggedIn" style="position: relative;">
                                                <span ng-if="$ctrl.cs.accounts.streamer.loggedIn" class="wizard-account-checkmark"><i class="fas fa-check-circle animated bounceIn"></i></span>
                                                配信者
                                            </b>
                                        </td>
                                        <td class="wizard-accounts-td" style="width: 50%; height: 50px;text-align: center;">
                                            <div ng-show="$ctrl.cs.accounts.streamer.loggedIn" class="wizard-accounts-login-display">
                                                <img class="login-thumbnail" ng-show="$ctrl.cs.accounts.streamer.loggedIn" ng-class="$ctrl.cs.accounts.streamer.loggedIn ? 'animated flipInX' : ''" style="height: 34px; width: 34px;" ng-src="{{$ctrl.getAccountAvatar('streamer')}}">
                                                <div class="animated fadeIn">
                                                    {{$ctrl.cs.accounts.streamer.username}}
                                                </div>
                                            </div>
                                            <div ng-hide="$ctrl.cs.accounts.streamer.loggedIn">
                                                    <a class="clickable" ng-click="$ctrl.loginOrLogout('streamer')">+ <b>配信者</b>アカウントを追加</a><span style="color:red;">*</span>
                                            </div>
                                        </td>
                                        <td class="wizard-accounts-td text-right" class="animated fadeIn">
                                            <a ng-show="$ctrl.cs.accounts.streamer.loggedIn" class="clickable" ng-click="$ctrl.loginOrLogout('streamer')">ログアウト</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="wizard-accounts-td text-left">
                                            <b ng-show="$ctrl.cs.accounts.bot.loggedIn" style="position: relative;">
                                                <span ng-if="$ctrl.cs.accounts.bot.loggedIn" class="wizard-account-checkmark"><i class="fas fa-check-circle animated bounceIn" style=""></i></span>
                                                Bot
                                            </b>
                                        </td>
                                        <td class="wizard-accounts-td" style="width: 50%; height: 50px;text-align: center;">
                                            <div ng-show="$ctrl.cs.accounts.bot.loggedIn" class="wizard-accounts-login-display">
                                                <img class="login-thumbnail" ng-show="$ctrl.cs.accounts.bot.loggedIn" ng-class="$ctrl.cs.accounts.bot.loggedIn ? 'animated flipInX' : ''" style="height: 34px; width: 34px;" ng-src="{{$ctrl.getAccountAvatar('bot')}}">
                                                <div>
                                                    {{$ctrl.cs.accounts.bot.username}}
                                                </div>
                                            </div>
                                            <div ng-hide="$ctrl.cs.accounts.bot.loggedIn">
                                                    <a class="clickable" ng-click="$ctrl.loginOrLogout('bot')">+ <b>Bot</b>アカウントを追加</a> <span class="muted" style="font-size:11px">任意</span>
                                            </div>
                                        </td>
                                        <td class="wizard-accounts-td text-right">
                                            <a ng-show="$ctrl.cs.accounts.bot.loggedIn" class="clickable" ng-click="$ctrl.loginOrLogout('bot')">ログアウト</a>
                                        </td>
                                    </tr>
                            </tbody>
                        </table>
                            <span style="font-size: 12px; opacity: 0.8; margin-top: 3px;">補足: ログイン状態はアプリ右上からいつでも管理できます。</span>
                        </div>
                    </div>

                    <div ng-switch-when="2" class="wave">

                        <p>オーバーレイを使うと、Firebot で画像・動画などを配信上に表示できます。</p>

                        <p>オーバーレイを設定するには、下記URLをコピーし、配信ソフトで新しい <b>ブラウザ/ウェブページソース</b> の URL に貼り付けてください。</p>

                        <div style="margin: 15px 0;display: flex;justify-content: center;">
                            <div class="input-group" style="width:75%;">
                                <input type="text" class="form-control" style="cursor:text;" ng-model="$ctrl.overlayPath" disabled>
                                <span class="input-group-btn">
                                    <button class="btn btn-default" type="button" ng-click="$ctrl.copyOverlayPath()">コピー</button>
                                </span>
                            </div>
                        </div>

                        <p class="muted" style="font-size:12px;">補足: 「Local File」は選択せず、ブラウザソースはキャンバス全体（例: 1920x1080 / 1280x720）に合わせてください。</Make>

                        <div style="display: flex; flex-direction: row; justify-content: space-around; width: 100%;">
                            <div class="connection-tile">
                                <span class="connection-title">オーバーレイ状態</span>
                                <div class="overlay-button" ng-class="{ 'connected': $ctrl.getOverlayStatusId() == 1, 'warning': $ctrl.getOverlayStatusId() == 0,'disconnected': $ctrl.getOverlayStatusId() == -1  }">
                                    <i class="fal fa-tv-retro"></i>
                                </div>
                                <div style="text-align: center; font-size: 11px;" class="muted">{{ $ctrl.overlayConnectionMessage()}}</div>
                            </div>
                        </div>
                    </div>

                    <div ng-switch-when="3" class="wave">
                        <p>Firebot コミュニティが作る素晴らしいインタラクティブ体験を<br />私たちは紹介しています。</p>
                        <p style="font-weight: 700;margin-top: 20px;">配信中に <a href="https:firebot.app/watch">公式サイトで掲載</a> してもよろしいですか？</p>
                        <div style="margin-top: 20px;">
                            <label class="control-fb control--checkbox" style="margin-bottom: 0px; font-size: 16px;opacity:0.9;display:inline-block;"> はい、配信を掲載してほしいです！
                                <input type="checkbox" ng-click="$ctrl.settings.saveSetting('WebOnlineCheckin', !$ctrl.settings.getSetting('WebOnlineCheckin'))" ng-checked="$ctrl.settings.getSetting('WebOnlineCheckin')" >
                                <div class="control__indicator"></div>
                            </label>
                        </div>
                        <div style="margin-top: 10px;">
                            <p class="muted" style="font-size: 12px; opacity: 0.8;">（この設定はいつでも変更できます）</p>
                        </div>
                    </div>

                    <div ng-switch-when="4" class="slide-fade">
                        <div style="margin-top: 20px" class="animated fadeIn">
                            <img style="width: 80px; height: 80px" class="jump-infinite" src="../images/logo_transparent.png">
                        </div>
                        <h1 style="margin-top: 0px;animation-delay: 0.4s" class="animated bounceIn">準備完了です！</h1>
                        <br>
                        <p style="animation-delay: 0.8s" class="animated fadeIn">
                            困ったことや提案があれば、ぜひお知らせください。<br><b>ヘルプ</b> > <b>About</b> から連絡先を確認できます。
                        </p>
                        <br>
                        <p style="animation-delay: 1.8s" class="animated fadeIn">
                            <b>Firebot をご利用いただきありがとうございます。</b>
                        </p>
                        <div style="animation-delay: 2.3s" class="animated fadeIn">
                            <a style="margin-top: 5px;" class="btn btn-primary" ng-click="$ctrl.handleNext()">さっそく始める！</a>
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer"  style="min-height: 64px; text-align: center;">

                <div ng-if="$ctrl.isFirstStep()">
                    <span style="animation-delay: 3.3s;display: flex;flex-direction: row;justify-content: center;align-items: center;" class="animated fadeIn">
                        <a class="btn btn-link import-settings-btn" ng-click="$ctrl.startBackupRestoreProcess()">バックアップから復元</a>
                    </span>
                </div>

                <div>
                    <a class="btn btn-default hvr-icon-back" ng-click="$ctrl.handlePrevious()" ng-show="$ctrl.showBackButton()"><i class="fas fa-arrow-left hvr-icon"></i> 戻る</a>
                    <a
                        class="btn btn-primary hvr-icon-forward"
                        uib-tooltip="{{$ctrl.getTooltipText()}}"
                        tooltip-enable="!$ctrl.canGoToNext()"
                        ng-click="$ctrl.handleNext()"
                        ng-show="$ctrl.showNextButton()"
                        ng-disabled="!$ctrl.canGoToNext()">
                            {{$ctrl.getNextLabel()}}
                            <i class="fas fa-arrow-right hvr-icon"></i>
                    </a>
                </div>
                <div>
                    <a class="btn btn-link" style="font-size: 10px;" ng-click="$ctrl.handleNext(true)" ng-show="$ctrl.showNextButton() && !$ctrl.canGoToNext()">いまはスキップ</a>
                </div>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function($rootScope, connectionService, connectionManager,
            overlayUrlHelper, ngToast, backendCommunicator, backupService, settingsService) {
            const $ctrl = this;

            $ctrl.settings = settingsService;

            $ctrl.step = 0;

            $ctrl.stepTitles = [
                "",
                "ログイン設定",
                "オーバーレイ設定",
                "配信掲載の設定",
                ""
            ];

            $ctrl.getAccountAvatar = connectionService.getAccountAvatar;

            $ctrl.isFirstStep = function() {
                return $ctrl.step === 0;
            };

            $ctrl.isLastStep = function() {
                return $ctrl.step === $ctrl.stepTitles.length - 1;
            };

            $ctrl.isCurrentStep = function(step) {
                return $ctrl.step === step;
            };

            $ctrl.setCurrentStep = function(step) {
                $ctrl.step = step;
            };

            $ctrl.getCurrentStep = function() {
                return $ctrl.step;
            };

            $ctrl.getStepTitle = function() {
                return $ctrl.stepTitles[$ctrl.step];
            };

            $ctrl.getNextLabel = function() {
                return "次へ";
            };

            $ctrl.handlePrevious = function() {
                $ctrl.step -= $ctrl.isFirstStep() ? 0 : 1;
            };

            $ctrl.showNextButton = function() {
                if ($ctrl.isFirstStep() || $ctrl.isLastStep()) {
                    return false;
                }
                return true;
            };

            $ctrl.showBackButton = function() {
                if ($ctrl.step === 1) {
                    return false;
                }
                return !($ctrl.isFirstStep() || $ctrl.isLastStep());
            };

            $ctrl.canGoToNext = function() {
                switch ($ctrl.step) {
                    case 1:
                        return connectionService.accounts.streamer.loggedIn;
                    case 2: {
                        const overlayStatus = connectionManager.getOverlayStatus();
                        return !overlayStatus.serverStarted || overlayStatus.clientsConnected;
                    }
                }
                return true;
            };
            $ctrl.handleNext = async function(forceNext) {
                if ($ctrl.isLastStep()) {
                    $ctrl.close();
                } else {
                    if (!$ctrl.canGoToNext() && !forceNext) {
                        return;
                    }
                    $ctrl.step += 1;
                }
            };

            $ctrl.getTooltipText = function() {
                switch ($ctrl.step) {
                    case 1:
                        return "配信者アカウントにログインしてください。";
                    case 2:
                        return "配信ソフトにオーバーレイURLを追加してください。";
                }
                return "";
            };

            $ctrl.cs = connectionService;
            $ctrl.loginOrLogout = connectionService.loginOrLogout;

            $ctrl.overlayPath = overlayUrlHelper.getOverlayPath();

            $ctrl.copyOverlayPath = function() {
                $rootScope.copyTextToClipboard($ctrl.overlayPath);

                ngToast.create({
                    className: 'success',
                    content: 'オーバーレイURLをコピーしました！'
                });
            };

            let overlayStatusId = 0;
            $ctrl.overlayConnectionMessage = function() {
                const connectionStatus = connectionManager
                    .getConnectionStatusForService("overlay");
                if (connectionStatus === "connected") {
                    overlayStatusId = 1;
                    return "接続済み";
                } else if (connectionStatus === "warning") {
                    overlayStatusId = 0;
                    return "準備完了。ただし現在接続はありません。";
                }
                overlayStatusId = -1;
                return "Webサーバー起動エラー。アプリの再起動が必要です。";
            };

            $ctrl.getOverlayStatusId = function() {
                return overlayStatusId;
            };

            $ctrl.startBackupRestoreProcess = () => {
                backupService.openBackupZipFilePicker()
                    .then((backupFilePath) => {
                        if (backupFilePath != null) {
                            backupService.initiateBackupRestore(backupFilePath);
                        }
                    });
            };
        }
    });
}());