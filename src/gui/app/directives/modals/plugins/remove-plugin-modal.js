"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("removePluginModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.cancel()"><span>&times;</span></button>
                <h4 class="modal-title">プラグインの削除</h4>
            </div>
            <div class="modal-body">
                <p>プラグイン <strong>{{$ctrl.pluginName}}</strong> を削除してもよろしいですか？</p>
                <firebot-checkbox
                    label="scripts フォルダーからプラグインファイルも削除する"
                    model="$ctrl.deletePluginFile"
                    ng-if="$ctrl.isCommunityPlugin !== true"
                ></firebot-checkbox>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.cancel()">キャンセル</button>
                <button type="button" class="btn btn-danger" ng-click="$ctrl.confirm()">削除</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function() {
                const $ctrl = this;

                $ctrl.pluginName = "";
                $ctrl.deletePluginFile = false;

                $ctrl.$onInit = function() {
                    $ctrl.pluginName = $ctrl.resolve.pluginName;
                    $ctrl.isCommunityPlugin = $ctrl.resolve.isCommunityPlugin;
                };

                $ctrl.confirm = function() {
                    $ctrl.close({
                        $value: {
                            confirmed: true,
                            deletePluginFile: $ctrl.deletePluginFile === true
                                || $ctrl.isCommunityPlugin === true
                        }
                    });
                };

                $ctrl.cancel = function() {
                    $ctrl.dismiss();
                };
            }
        });
}());
