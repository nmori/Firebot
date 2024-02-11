"use strict";

(function() {
    angular.module("firebotApp")
        .component("purgeViewersModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">視聴者を削除</h4>
                </div>
                <div class="modal-body">
                    <div>
                        <h4 style="margin-top: 15px;">Twitch</h4>
                        <b>どの視聴者を削除するか...</b>
                        <label class="control-fb control--checkbox" style="font-size: 13px;margin-top: 5px;"> n日以上来訪していない
                            <input type="checkbox" ng-model="$ctrl.options.daysSinceActive.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.daysSinceActive.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <input type="number" class="form-control" ng-model="$ctrl.options.daysSinceActive.value" style="width: 85px;">
                                    <span>日</span>
                                </div>
                            </form>
                        </div>
                        <label class="control-fb control--checkbox" style="font-size: 13px;"> 視聴時間がn時間以内
                            <input type="checkbox" ng-model="$ctrl.options.viewTimeHours.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.viewTimeHours.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <input type="number" class="form-control" ng-model="$ctrl.options.viewTimeHours.value" style="width: 85px;">
                                    <span>時間</span>
                                </div>
                            </form>
                        </div>
                        <label class="control-fb control--checkbox" style="font-size: 13px;"> チャット送信回数が n回未満
                            <input type="checkbox" ng-model="$ctrl.options.chatMessagesSent.enabled">
                            <div class="control__indicator"></div>
                        </label>
                        <div style="padding: 0 0 20px 0px;" ng-show="$ctrl.options.chatMessagesSent.enabled">
                            <form class="form-inline">
                                <div class="form-group">
                                    <span>チャット: </span>
                                    <input type="number" class="form-control" ng-model="$ctrl.options.chatMessagesSent.value" style="width: 85px;">
                                </div>
                            </form>
                        </div>
                        <p class="muted">注：視聴者が削除（フィルタ）されるには、上記の選択された基準をすべて満たす必要があります。</p>
                    </div>
                </div>
                <div class="modal-footer" style="text-align: center;">
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.getPurgePreview()">削除対象を表示</button>
                    <button type="button" class="btn btn-danger" ng-click="$ctrl.confirmPurge()">削除を実行</button>
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
                    }
                };

                $ctrl.getPurgePreview = () => {
                    $rootScope.showSpinner = true;
                    $q.when(backendCommunicator.fireEventAsync("get-purge-preview", $ctrl.options))
                        .then((users) => {
                            $rootScope.showSpinner = false;
                            utilityService.showModal({
                                component: "previewPurgeModal",
                                backdrop: true,
                                resolveObj: {
                                    viewers: () => users
                                }
                            });
                        });
                };

                $ctrl.confirmPurge = () => {
                    utilityService
                        .showConfirmationModal({
                            title: "削除を承認",
                            question: `本当に削除しますか？もし必要であれば、最初にプレビューを使用して、何を削除するかを確認することができます。`,
                            confirmLabel: "削除を実施",
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
                                            content: ` ${purgedCount} 人の視聴者を削除しました`
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
