"use strict";

(function() {
    angular.module("firebotApp").component("dcfCodeDisplay", {
        bindings: {
            type: "@",
            onCompleteOrClose: "&"
        },
        template: `
        <div style="width: 100%; height: 100%;">
            <div ng-if="$ctrl.loaded === false">
                <div class="loader">読み込み中...</div>
            </div>
            <div style="text-align:center;" ng-if="$ctrl.loaded === true">
                <h4 class="mb-8"><strong class="capitalize">{{$ctrl.accountType}}</strong> アカウントを繋げましょう</h4>
                <p class="muted px-15">
                    {{$ctrl.accountType === 'streamer' ? 'ここを押すか、' : ''}} 以下のURLをブラウザにコピーして<br>Twitch <strong>{{$ctrl.accountType}}</strong> アカウントでログインします。
                    <span ng-if="$ctrl.accountType && $ctrl.accountType === 'bot'" style="font-style: italic;"><br><br>注意：配信アカウントで意図せずログインしてしまうことを避けるため、ブラウザのシークレットウィンドウで実行するとよいでしょう。</span>
                </p>
                <div class="dcf-link-panel">
                    <div class="dcf-link-container truncate">
                        <button ng-if="$ctrl.accountType === 'streamer'" class="btn btn-link" style="padding: 0;" ng-click="$ctrl.openInBrowser()">{{$ctrl.loginUrl}}</button>
                        <span ng-if="$ctrl.accountType === 'bot'">{{$ctrl.loginUrl}}</span>
                        <div
                            class="dcf-clone-btn"
                            ng-class="{ 'is-cta': $ctrl.accountType === 'bot' }"
                            ng-click="$ctrl.copy()"
                            uib-tooltip="{{$ctrl.copiedLink ? 'コピーしました!' : $ctrl.tooltipText}}"
                            tooltip-append-to-body="true"
                            aria-label="{{$ctrl.tooltipText}}"
                        >
                            <i class="fas" ng-class="$ctrl.copiedLink ? 'fa-check' : 'fa-clone'"></i>
                        </div>
                    </div>
                    <div class="my-5">
                        <p class="muted">URLを開いたら、以下のコードで認証をしてください：</p>
                        <h2 class="my-8" style="letter-spacing: 0.3em; font-family: monospace;">{{$ctrl.code}}</h2>
                        <div>
                            <i class="far fa-spinner-third fa-spin" style="font-size: 48px;"></i>
                        </div>
                        <div class="muted mt-5">ログインをまっています...</div>
                    </div>
                </div>
                <button class="btn btn-link mt-5" ng-click="$ctrl.dismiss()">キャンセル</button>
            </div>
        </div>
          `,
        controller: function($rootScope, $timeout, backendCommunicator, utilityService) {
            const $ctrl = this;
            $ctrl.loaded = false;
            $ctrl.copiedLink = false;

            backendCommunicator.on("device-code-received", (details) => {
                $ctrl.loaded = true;
                $ctrl.loginUrl = details.loginUrl;
                $ctrl.code = details.code;
            });

            backendCommunicator.on("accountUpdate", accounts => {
                switch ($ctrl.accountType) {
                    case "streamer":
                        if (accounts.streamer.loggedIn) {
                            $ctrl.dismiss();
                        }
                        break;
                    case "bot":
                        if (accounts.bot.loggedIn) {
                            $ctrl.dismiss();
                        }
                        break;
                    default:
                        break;
                }
            });

            $ctrl.loginUrl = "https://www.twitch.tv/activate";
            $ctrl.code = "";

            $ctrl.dismiss = function() {
                backendCommunicator.send("cancel-device-token-check");
                $ctrl.onCompleteOrClose();
            };

            $ctrl.openInBrowser = function() {
                $rootScope.openLinkExternally($ctrl.loginUrl);
            };

            $ctrl.copy = function() {
                $rootScope.copyTextToClipboard($ctrl.loginUrl);

                $ctrl.copiedLink = true;
                $timeout(() => {
                    $ctrl.copiedLink = false;
                }, 2000);
            };

            $ctrl.$onInit = function() {
                $ctrl.accountType = $ctrl.type;
                $ctrl.tooltipText = `${utilityService.capitalize($ctrl.accountType)} のログインURLをコピー`;
                backendCommunicator.fireEventAsync("begin-device-auth", `twitch:${$ctrl.accountType}-account`);
            };
        }
    });
}());
