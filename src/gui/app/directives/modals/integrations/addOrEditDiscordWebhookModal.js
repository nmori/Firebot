"use strict";

(function() {

    const { randomUUID } = require("crypto");

    angular.module("firebotApp")
        .component("addOrEditDiscordWebhookModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">Discord チャンネル</h4>
            </div>
            <div class="modal-body">

                <div>
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        名前
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.nameError}">
                            <input type="text" id="nameField" class="form-control" ng-model="$ctrl.channel.name" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="helpBlock" placeholder="名前を入力">
                            <span id="helpBlock" class="help-block" ng-show="$ctrl.nameError">名前を入力してください。</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        Webhook URL
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.urlError}">
                            <input type="text" id="urlField" class="form-control" ng-model="$ctrl.channel.webhookUrl" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="urlHelpBlock" placeholder="URLを入力">
                            <span id="urlHelpBlock" class="help-block" ng-show="$ctrl.urlError">有効な Discord Webhook URL を入力してください</span>
                        </div>
                        <collapsable-section show-text="Webhook URL はどこで取得しますか？" hide-text="Webhook URL はどこで取得しますか？"  text-color="#0b8dc6">
                            <ol style="font-weight: 100;font-size: 15px;">
                                <li style="margin: 5px 0;">Discord で、Firebot から投稿したいチャンネルの設定を開きます <span class="muted">（チャンネル名横の歯車）</span></li>
                                <li style="margin: 5px 0;"><b>連携（Integrations）</b> タブを開きます</li>
                                <li style="margin: 5px 0;"><b>Webhook を作成（Create Webhook）</b> をクリックします</li>
                                <li style="margin: 5px 0;">Webhook 名を設定します <span class="muted">（任意。チャンネル名やBotアカウント名がおすすめ。Firebot側でも上書き設定できます）</span></li>
                                <li style="margin: 5px 0;">Webhook のアバター画像をアップロードします <span class="muted">（任意。Firebot側でも上書き設定できます）</span></li>
                                <li style="margin: 5px 0;">下部の Webhook URL を<b>コピー</b>します</li>
                                <li style="margin: 5px 0;"><b>保存（Save）</b> をクリックします <span class="muted">（重要）</span></li>
                                <li style="margin: 5px 0;">上の入力欄に Webhook URL を貼り付けます</li>
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
                    id: randomUUID(),
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
