"use strict";

(function() {
    angular.module("firebotApp").component("aboutModal", {
        template: `
            <style>
                #aboutModalHeaderDismissButton {
                    z-index: 10;
                }

                #aboutModalBody > section:not(:first-child) {
                    margin-top: 1.5em;
                }

                #aboutModalSocialButtons > a:not(:first-child) {
                    margin-left: 1em;
                }
            </style>
            <div class="modal-header" style="text-align: center;">
                <button type="button" id="aboutModalHeaderDismissButton" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
            </div>
            <div id="aboutModalBody" class="modal-body" style="text-align: center; margin-top: -50px;">
                <section>
                    <a href ng-click="$root.openLinkExternally('https://firebot.app')"><img style="width: 160px; height: 160px" src="../images/logo_transparent.png"></a>
                </section>

                <section>
                    <h5><b>コンタクト方法</b></h5>
                    <div id="aboutModalSocialButtons" style="font-size: 28px;">
                        <a href ng-click="$root.openLinkExternally('https://discord.gg/tTmMbrG')" title="Discord"><i class="fab fa-discord"></i></a>
                        <a href ng-click="$root.openLinkExternally('https://twitter.com/FirebotApp')" title="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href ng-click="$root.openLinkExternally('https://github.com/crowbartools/Firebot')" title="GitHub"><i class="fab fa-github"></i></a>
                    </div>
                </section>

                <section>
                    <h5><b>Versions</b></h5>
                    <p>
                        Firebot: {{$ctrl.version}}<br/>
                        OS: {{$ctrl.osType}} {{$ctrl.osVersion}}
                    </p>
                </section>

                <section>
                    <h5><b>ライセンス</b></h5>
                    <p>
                        Firebot は GPLv3 でライセンスされています<br/>
                        <a href ng-click="$root.openLinkExternally('https://github.com/crowbartools/Firebot/blob/master/license.txt')">ライセンスを表示</a>
                    </p>
                </section>

                <section>
                    <h5><b>サポート</b></h5>
                    <p>
                        <a href ng-click="$root.openLinkExternally('https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Bug&template=bug_report.yml&title=%5BBug%5D+')">不具合報告</a> |
                        <a href ng-click="$root.openLinkExternally('https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Enhancement&template=feature_request.md&title=%5BFeature+Request%5D+')">リクエスト</a> |
                        <a href ng-click="$root.openLinkExternally('https://opencollective.com/crowbartools')">寄付</a> |
                        <a href ng-click="$root.openLinkExternally('https://crowbar-tools.myspreadshop.com')">ストア</a> |
                        <a href ng-click="$root.openLinkExternally('https://firebot.app/testimonial-submission')">お客様の声</a>
                    </p>
                </section>


                <section>
                    <h5><b>日本語ローカライズ</b></h5>
                    <p>
                        <a href ng-click="$root.openLinkExternally('https://github.com/nmori/Firebot/issues/new?assignees=&labels=Bug&template=bug_report.yml&title=%5BBug%5D+')">翻訳改善提案</a> |
                        <a href ng-click="$root.openLinkExternally('https://kojipro.live/')">こじプロ(翻訳企画チーム)</a> |
                        <a href ng-click="$root.openLinkExternally('https://twitter.com/mikasa231')">主担当</a>
                    </p>
                </section> 
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function() {
            const $ctrl = this;

            $ctrl.$onInit = function() {
                $ctrl.version = firebotAppDetails.version;
                $ctrl.osType = firebotAppDetails.os.type;
                $ctrl.osVersion = firebotAppDetails.os.release;
            };
        }
    });
}());