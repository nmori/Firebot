"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("giftReceiversList", {
            bindings: {
                model: "=",
                onUpdate: '&'
            },
            template: `
                <div>
                    <div ng-repeat="receiver in $ctrl.model track by $index" class="list-item selectable" ng-click="$ctrl.showAddOrEditGiftReceiverModal(receiver)">
                        <div uib-tooltip="クリックして編集" class="ml-8" style="font-weight: 400;width: 100%;" aria-label="{{receiver.gifteeUsername + ' (クリックして編集)'}}"><div><b>受取ユーザー名:</b> {{receiver.gifteeUsername}}</div></div>
                        <span class="clickable" style="color: #fb7373;" ng-click="$ctrl.removeGiftReceiverAtIndex($index);$event.stopPropagation();" aria-label="ギフト受取ユーザーを削除">
                            <i class="fad fa-trash-alt" aria-hidden="true"></i>
                        </span>
                    </div>
                    <p class="muted" ng-show="$ctrl.model.length < 1">ギフト受取ユーザーが追加されていません。</p>
                    <div class="mx-0 mt-2.5 mb-4">
                        <button class="filter-bar" ng-click="$ctrl.showAddOrEditGiftReceiverModal()" uib-tooltip="ギフト受取ユーザーを追加" tooltip-append-to-body="true" aria-label="ギフト受取ユーザーを追加">
                            <i class="far fa-plus"></i>
                        </button>
                    </div>
                </div>
            `,
            controller: function(utilityService) {
                const $ctrl = this;

                $ctrl.$onInit = () => {
                    if ($ctrl.model == null) {
                        $ctrl.model = [];
                    }
                };

                $ctrl.showAddOrEditGiftReceiverModal = (giftReceiver) => {
                    utilityService.showModal({
                        component: "addOrEditGiftReceiverModal",
                        size: "sm",
                        resolveObj: {
                            giftReceiver: () => giftReceiver
                        },
                        closeCallback: (giftReceiver) => {
                            $ctrl.model = $ctrl.model.filter(gr => gr.gifteeUsername !== giftReceiver.gifteeUsername);
                            $ctrl.model.push(giftReceiver);
                        }
                    });
                };


                $ctrl.removeGiftReceiverAtIndex = (index) => {
                    $ctrl.model.splice(index, 1);
                };

            }
        });
}());