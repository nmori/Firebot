"use strict";

(function() {
    const { randomUUID } = require("crypto");

    angular.module("firebotApp")
        .component("addOrEditPollChoiceModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.isNew ? '追加' : '編集'}} 選択肢</h4>
                </div>
                <div class="modal-body">

                    <form name="pollChoice">

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('title')}">
                            <label for="title" class="control-label">投票選択肢</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                class="form-control input-md"
                                placeholder="投票選択肢を入力"
                                ng-model="$ctrl.pollChoice.title"
                                ui-validate="'$value != null && $value.length > 0'"
                                required
                                menu-position="under"
                            />
                        </div>

                        <div class="form-group" ng-hide="$ctrl.options.hideVotes" ng-class="{'has-error': $ctrl.formFieldHasError('totalVotes')}">
                            <label for="totalVotes" class="control-label">総投票数</label>
                            <input
                                type="number"
                                id="totalVotes"
                                name="totalVotes"
                                class="form-control input-md"
                                placeholder="総投票数を入力"
                                ng-model="$ctrl.pollChoice.totalVotes"
                                ui-validate="'($value != null && $value >= 0) || $ctrl.options.hideVotes'"
                                ng-required="!$ctrl.options.hideVotes"
                                menu-position="under"
                            />
                        </div>

                        <div class="form-group" ng-hide="$ctrl.options.hideVotes" ng-class="{'has-error': $ctrl.formFieldHasError('channelPointsVotes')}">
                            <label for="channelPointsVotes" class="control-label">チャンネルポイント投票数</label>
                            <input
                                type="number"
                                id="channelPointsVotes"
                                name="channelPointsVotes"
                                class="form-control input-md"
                                placeholder="チャンネルポイント投票数を入力"
                                ng-model="$ctrl.pollChoice.channelPointsVotes"
                                ui-validate="'($value != null && $value >= 0) || $ctrl.options.hideVotes'"
                                ng-required="!$ctrl.options.hideVotes"
                                menu-position="under"
                            />
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($scope) {
                const $ctrl = this;

                $ctrl.isNew = true;

                $ctrl.pollChoice = {
                    title: null,
                    totalVotes: null,
                    channelPointsVotes: null,
                    id: null
                };

                $ctrl.formFieldHasError = (fieldName) => {
                    return ($scope.pollChoice.$submitted || $scope.pollChoice[fieldName].$touched)
                        && $scope.pollChoice[fieldName].$invalid;
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.pollChoice != null) {
                        $ctrl.pollChoice = JSON.parse(angular.toJson($ctrl.resolve.pollChoice));
                        $ctrl.isNew = false;
                    } else {
                        $ctrl.pollChoice.id = randomUUID();
                    }
                    $ctrl.options = JSON.parse(angular.toJson($ctrl.resolve.options));
                };

                $ctrl.save = () => {
                    $scope.pollChoice.$setSubmitted();
                    if ($scope.pollChoice.$invalid) {
                        return;
                    }

                    $ctrl.close({
                        $value: $ctrl.pollChoice
                    });
                };
            }
        });
}());
