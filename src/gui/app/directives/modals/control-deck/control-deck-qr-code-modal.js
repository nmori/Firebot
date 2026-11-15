"use strict";

(function() {
    const QRCode = require("qrcode");

    angular.module("firebotApp").component("controlDeckQrCodeModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">コントロールデッキのQRコード</h4>
            </div>
            <div class="modal-body">
                <p class="muted text-center">スマートフォンやタブレットでこのQRコードを読み取るか、ブラウザーでURLにアクセスしてください。</p>
                <div class="flex flex-column items-center justify-center gap-4">
                    <dropdown-select
                        options="$ctrl.urlModeOptions"
                        selected="$ctrl.urlMode"
                        on-update="$ctrl.onUrlModeChange()"
                    ></dropdown-select>
                    <img ng-if="$ctrl.qrDataUrl" ng-src="{{$ctrl.qrDataUrl}}" alt="コントロールデッキのQRコード" class="my-6" style="width: 180px; height: 180px; background: #fff; border-radius: 8px; padding: 8px;" />
                    <div style="flex: 1;" class="w-full">
                        <copy-text-display text="$ctrl.url" tooltip-text="コントロールデッキのURLをコピー"></copy-text-display>
                    </div>
                    <div class="w-full mt-5">
                        <collapsable-panel header="iOS のトラブルシューティング">
                            <p>iOS で「cannot open in https-only mode」（HTTPS専用モードでは開けません）というエラーが出る場合は、次の手順に従ってください:</p>
                            <ol>
                                <li>「設定」アプリを開きます</li>
                                <li>Safari の設定に移動します</li>
                                <li>「プライバシーとセキュリティ」セクションで「安全でない接続の警告」（Not Secure Connection Warning）をオフにします</li>
                            </ol>
                            <p>画面をより広く使いたい場合:</p>
                            <ol>
                                <li>Safari でコントロールデッキのページを開きます</li>
                                <li>共有ボタンを押して「ホーム画面に追加」を選択します</li>
                                <li>「Webアプリとして開く」がオンになっていることを確認します</li>
                            </ol>
                        </collapsable-panel>
                    </div>
                   <div class="w-full mt-5">
                        <collapsable-panel header="Android のトラブルシューティング">
                            <p>ページの読み込みに問題がある場合は、次の方法を試してください:</p>
                            <ol>
                                <li>上で「直接IP」のURLに切り替えて、QRコードをもう一度読み取ります</li>
                            </ol>
                        </collapsable-panel>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            </div>
        `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function($scope, settingsService, backendCommunicator) {
            const $ctrl = this;

            $ctrl.url = "";
            $ctrl.qrDataUrl = "";

            $ctrl.urlMode = "local";
            $ctrl.urlModeOptions = {
                local: "ローカルURL",
                direct: "直接IP"
            };

            let directHost = null;
            let localHost = null;

            function buildUrl() {
                const port = settingsService.getSetting("WebServerPort");
                let host;
                if ($ctrl.urlMode === "local") {
                    host = localHost || directHost || "localhost";
                } else {
                    host = directHost || "localhost";
                }
                $ctrl.url = `http://${host}:${port}/control-deck/`;
                $ctrl.generateQr();
            }

            $ctrl.onUrlModeChange = () => {
                buildUrl();
            };

            $ctrl.$onInit = () => {
                Promise.all([
                    backendCommunicator.fireEventAsync("get-ip-address"),
                    backendCommunicator.fireEventAsync("get-bonjour-host")
                ]).then(([ip, bonjourHost]) => {
                    directHost = ip || null;
                    localHost = bonjourHost || null;

                    // Default to Direct IP if the local hostname isn't available
                    if (localHost == null) {
                        $ctrl.urlMode = "direct";
                    }

                    $scope.$applyAsync(() => {
                        buildUrl();
                    });
                });
            };

            $ctrl.generateQr = () => {
                if (!$ctrl.url) {
                    return;
                }
                QRCode.toDataURL($ctrl.url, { width: 360, margin: 1 }, (err, dataUrl) => {
                    if (err) {
                        return;
                    }
                    $scope.$applyAsync(() => {
                        $ctrl.qrDataUrl = dataUrl;
                    });
                });
            };
        }
    });
}());
