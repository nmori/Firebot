"use strict";

(function() {

    const uuid = require("uuid/v4");

    angular.module("firebotApp")
        .component("addOrEditDiscordWebhookModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">Discord チャネル</h4>
            </div>
            <div class="modal-body">

                <div>
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        名前
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.nameError}">
                            <input type="text" id="nameField" class="form-control" ng-model="$ctrl.channel.name" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="helpBlock" placeholder="名前の入力">
                            <span id="helpBlock" class="help-block" ng-show="$ctrl.nameError">名前を入れてください</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        WebhookのURL
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.urlError}">
                            <input type="text" id="urlField" class="form-control" ng-model="$ctrl.channel.webhookUrl" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="urlHelpBlock" placeholder="Enter url">
                            <span id="urlHelpBlock" class="help-block" ng-show="$ctrl.urlError">Discord で提供された Webhook URLを指定します</span>
                        </div>
                        <collapsable-section show-text="WebhookのURLはどこで入手できますか？" hide-text="WebhookのURLはどこで入手できますか？  text-color="#0b8dc6">
                            <ol style="font-weight: 100;font-size: 15px;">
                                <li style="margin: 5px 0;">Discordで、Firebotにメッセージを投稿させたいチャンネルの<span class="muted">チャンネル設定を開きます。</span></li>
                                <li style="margin: 5px 0;"><b>連携</b>タブに移動する。</li>
                                <li style="margin: 5px 0;"><b>Webhookを作成</b>をクリックします。</li>
                                <li style="margin: 5px 0;">Webhook 二名前をつけます。<span class="muted">(任意。チャンネル名かボットアカウント名を指定します。Firebot でオーバーライドを設定することもできます)</span></li>
                                <li style="margin: 5px 0;">WebHook用のアバター画像をアップロードします。<span class="muted">(任意。Firebotのオーバーライドを設定することもできます)</span></li>
                                <li style="margin: 5px 0;">下部のWebhook URLを<b>コピー</b>します</li>
                                <li style="margin: 5px 0;"><b>保存</b>を押します。 <span class="muted">(重要!)</span></li>
                                <li style="margin: 5px 0;">上記のWebhookのURLを貼り付けてください</li>
                            </ol>
                        </collapsable-section>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($timeout) {
                const $ctrl = this;

                $timeout(() => {
                    angular.element("#nameField").trigger("focus");
                }, 50);


                $ctrl.channel = {
                    id: uuid(),
                    name: "",
                    webhookUrl: ""
                };

                $ctrl.$onInit = function() {
                    if ($ctrl.resolve.channel != null) {
                        $ctrl.channel = JSON.parse(JSON.stringify($ctrl.resolve.channel));
                    }
                };

                $ctrl.nameError = false;
                $ctrl.urlError = false;

                function validateName() {
                    const name = $ctrl.channel.name;
                    return name != null && name.length > 0;
                }

                function validateWebhookUrl() {
                    const discordWebhookRegex = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[^/\s]+\/[^/\s]+$/i;
                    const guildedWebhookRegex = /^https:\/\/media\.guilded?\.gg\/webhooks\/[^/\s]+\/[^/\s]+$/i;
                    const webhookUrl = $ctrl.channel.webhookUrl;
                    return webhookUrl != null && webhookUrl.length > 0 && (discordWebhookRegex.test(webhookUrl) || guildedWebhookRegex.test(webhookUrl));
                }

                $ctrl.save = function() {
                    $ctrl.nameError = false;
                    $ctrl.urlError = false;

                    if (!validateName()) {
                        $ctrl.nameError = true;
                    }

                    if (!validateWebhookUrl()) {
                        $ctrl.urlError = true;
                    }

                    if ($ctrl.nameError || $ctrl.urlError) {
                        return;
                    }

                    $ctrl.close({
                        $value: {
                            channel: $ctrl.channel
                        }
                    });
                };
            }
        });
}());
