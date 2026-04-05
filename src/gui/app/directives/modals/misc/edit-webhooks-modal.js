"use strict";

(function() {
    angular.module("firebotApp")
        .component("editWebhooksModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" aria-label="閉じる" ng-click="$ctrl.dismiss()"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">
                        Webhook
                    </h4>
                </div>
                <div class="modal-body firebot-list-container">
                    <div class="firebot-list-description">
                        <p class="muted" style="margin: 0 0 20px 0; font-size: 13px;">
                            <i class="fas fa-info-circle" style="margin-right: 6px;"></i>
                            Webhookを使うと外部サービスから Firebot のイベントを発火できます
                        </p>
                    </div>

                    <div class="firebot-list">
                        <div ng-repeat="webhook in $ctrl.whs.webhookConfigs track by webhook.id" class="firebot-list-item">
                            <div class="firebot-list-item-header">
                                <div class="firebot-list-item-info">
                                    <i class="fas fa-webhook" style="margin-right: 10px; opacity: 0.6;"></i>
                                    <span class="firebot-list-item-name">{{webhook.name}}</span>
                                    <span ng-if="webhook.scriptId != null" class="firebot-list-item-badge" uib-tooltip="このWebhookは {{webhook.scriptId}} スクリプトで管理されています。" tooltip-append-to-body="true">
                                        <i class="fas fa-plug" style="margin-right: 4px;"></i>プラグイン
                                    </span>
                                </div>
                                <div class="firebot-list-item-actions">
                                    <button class="btn btn-default btn-sm"
                                            ng-click="$ctrl.copyWebhookUrlToClipboard(webhook)"
                                            title="URLをクリップボードにコピー">
                                        <i class="far fa-copy"></i>
                                        <span>URLをコピー</span>
                                    </button>
                                    <button ng-if="webhook.scriptId == null"
                                            class="btn btn-danger btn-sm"
                                            ng-click="$ctrl.whs.deleteWebhookConfig(webhook.id)"
                                            title="Webhookを削除">
                                        <i class="far fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-primary btn-sm" style="width: 100%;" ng-click="$ctrl.createNewWebhook()">
                        <i class="fas fa-plus" style="margin-right: 6px;"></i>
                        Webhookを作成
                    </button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(accountAccess, webhooksService, modalFactory, $rootScope, ngToast) {
                const $ctrl = this;

                $ctrl.whs = webhooksService;

                $ctrl.createNewWebhook = () => {
                    modalFactory.openGetInputModal(
                        {
                            model: "",
                            label: "Webhook名",
                            saveText: "保存",
                            validationFn: (value) => {
                                return new Promise((resolve) => {
                                    if (value == null || value.trim().length < 1) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "Webhook名は空にできません。"
                        },
                        (newName) => {
                            webhooksService.saveWebhookConfig({
                                name: newName
                            });
                        });
                };

                $ctrl.copyWebhookUrlToClipboard = (webhook) => {
                    const channelId = accountAccess.accounts.streamer.channelId;
                    const webhookId = webhook.id;

                    const copyText = `https://api.crowbar.tools/v1/webhook/${channelId}/${webhookId}`;

                    $rootScope.copyTextToClipboard(copyText);

                    ngToast.create({
                        className: 'info',
                        content: `Webhook URLをクリップボードにコピーしました`
                    });
                };
            }
        });
}());