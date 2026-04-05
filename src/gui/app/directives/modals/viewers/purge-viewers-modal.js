"use strict";

(function() {
    angular.module("firebotApp")
        .component("purgeViewersModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">視聴者をパージ</h4>
                </div>
                <div class="modal-body">
                    <div>
                        <h4 style="margin-top: 15px;">Twitch</h4>
                        <b>次の条件に一致する視聴者をパージ...</b>
                        <label class="control-fb control--checkbox" style="font-size: 13px;margin-top: 5px;"> X 日以上アクティブでない
                            <input type="checkbox" ng-model="$ctrl.options.daysSinceActive.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.daysSinceActive.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <span>日数: </span>
                                    <input type="number" class="form-control" ng-model="$ctrl.options.daysSinceActive.value" style="width: 85px;">
                                </div>
                            </form>
                        </div>
                        <label class="control-fb control--checkbox" style="font-size: 13px;"> 視聴時間が X 時間未満
                            <input type="checkbox" ng-model="$ctrl.options.viewTimeHours.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.viewTimeHours.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <span>時間: </span>
                                    <input type="number" class="form-control" ng-model="$ctrl.options.viewTimeHours.value" style="width: 85px;">
                                </div>
                            </form>
                        </div>
                        <label class="control-fb control--checkbox" style="font-size: 13px;"> チャット送信数が X 件未満
                            <input type="checkbox" ng-model="$ctrl.options.chatMessagesSent.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.chatMessagesSent.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <span>メッセージ数: </span>
                                    <input type="number" class="form-control" ng-model="$ctrl.options.chatMessagesSent.value" style="width: 85px;">
                                </div>
                            </form>
                        </div>
                        <label class="control-fb control--checkbox" style="font-size: 13px;"> BAN されている
                            <input type="checkbox" ng-model="$ctrl.options.banned.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <p class="muted">補足: パージ対象になるには、上で選択した条件をすべて満たす必要があります（AND 条件）。</p>
                    </div>
                </div>
                <div class="modal-footer" style="text-align: center;">
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.getPurgePreview()">パージをプレビュー</button>
                    <button type="button" class="btn btn-danger" ng-click="$ctrl.confirmPurge()">パージを実行</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($q, backendCommunicator, $rootScope, utilityService, ngToast) {
                const $ctrl = this;

                $ctrl.options = {
                    daysSinceActive: {
                        enabled: false,
                        value: 0
                    },
                    viewTimeHours: {
                        enabled: false,
                        value: 0
                    },
                    chatMessagesSent: {
                        enabled: false,
                        value: 0
                    },
                    banned: {
                        enabled: false
                    }
                };

                $ctrl.getPurgePreview = () => {
                    $rootScope.showSpinner = true;
                    $q.when(backendCommunicator.fireEventAsync("get-purge-preview", $ctrl.options))
                        .then((viewers) => {
                            $rootScope.showSpinner = false;
                            utilityService.showModal({
                                component: "previewPurgeModal",
                                size: "lg",
                                backdrop: true,
                                resolveObj: {
                                    viewers: () => viewers
                                }
                            });
                        });
                };

                $ctrl.confirmPurge = () => {
                    utilityService
                        .showConfirmationModal({
                            title: "パージを確認",
                            question: `このパージを実行してもよろしいですか？必要であれば先に「パージをプレビュー」で対象を確認できます。`,
                            confirmLabel: "パージ",
                            confirmBtnType: "btn-danger"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                $rootScope.showSpinner = true;
                                $q.when(backendCommunicator.fireEventAsync("purge-viewers", $ctrl.options))
                                    .then((purgedCount) => {
                                        $rootScope.showSpinner = false;
                                        ngToast.create({
                                            className: 'success',
                                            content: `${purgedCount} 人の視聴者をパージしました。`
                                        });
                                        $ctrl.close();
                                    });
                            }
                        });
                };

                $ctrl.$onInit = () => {
                };
            }
        });
}());
