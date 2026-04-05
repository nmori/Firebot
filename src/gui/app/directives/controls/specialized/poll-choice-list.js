"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("pollChoiceList", {
            bindings: {
                model: "=",
                onUpdate: '&',
                options: "="
            },
            template: `
                <div>
                    <div ng-repeat="choice in $ctrl.model track by $index" class="list-item selectable" ng-click="$ctrl.showAddOrEditPollChoiceModal(choice)">
                        <div uib-tooltip="クリックして編集" class="ml-8" style="font-weight: 400;width: 100%;" aria-label="{{choice.title + ' (クリックして編集)'}}">
                            <div><b>タイトル:</b> {{choice.title}}</div>
                            <div ng-hide="$ctrl.options.hideVotes"><b>チャンネルポイント投票数:</b> {{choice.channelPointsVotes}}</div>
                            <div ng-hide="$ctrl.options.hideVotes"><b>総投票数:</b> {{choice.totalVotes}}</div>
                        </div>
                        <span class="clickable" style="color: #fb7373;" ng-click="$ctrl.removePollChoiceAtIndex($index);$event.stopPropagation();" aria-label="投票選択肢を削除">
                            <i class="fad fa-trash-alt" aria-hidden="true"></i>
                        </span>
                    </div>
                    <p class="muted" ng-show="$ctrl.model.length == 0">選択肢が追加されていません。</p>
                    <p class="muted" ng-show="$ctrl.model.length < 2 && $ctrl.model.length != 0 ">選択肢が不足しています。</p>
                    <div class="mx-0 mt-2.5 mb-4">
                        <button ng-if="$ctrl.model.length < 5" class="filter-bar" ng-click="$ctrl.showAddOrEditPollChoiceModal()" uib-tooltip="投票選択肢を追加" tooltip-append-to-body="true" aria-label="投票選択肢を追加">
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

                $ctrl.showAddOrEditPollChoiceModal = (pollChoice) => {
                    utilityService.showModal({
                        component: "addOrEditPollChoiceModal",
                        size: "sm",
                        resolveObj: {
                            pollChoice: () => pollChoice,
                            options: () => $ctrl.options
                        },
                        closeCallback: (pollChoice) => {
                            $ctrl.model = $ctrl.model.filter(pc => pc.id !== pollChoice.id);
                            $ctrl.model.push(pollChoice);
                        }
                    });
                };


                $ctrl.removePollChoiceAtIndex = (index) => {
                    $ctrl.model.splice(index, 1);
                };

            }
        });
}());