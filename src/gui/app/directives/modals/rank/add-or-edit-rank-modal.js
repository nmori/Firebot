"use strict";
(function() {

    const { randomUUID } = require("crypto");

    angular.module("firebotApp").component("addOrEditRankModal", {
        template: `
            <div class="modal-header">
                <button
                    type="button"
                    class="close"
                    aria-label="閉じる"
                    ng-click="$ctrl.dismiss()"
                >
                    <i class="fal fa-times" aria-hidden="true"></i>
                </button>
                <h4 class="modal-title">
                    <div class="action text-4xl">{{ $ctrl.isNewRank ? 'ランクを追加' : 'ランクを編集' }}</div>
                </h4>
            </div>
            <div class="modal-body">
                <form name="rankSettings">
                    <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('name')}">
                        <label for="name" class="control-label">名前</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            ng-minlength="2"
                            ui-validate="{taken:'!$ctrl.isNameTaken($value)'}"
                            required
                            class="form-control input-lg"
                            placeholder="ランク名を入力"
                            ng-model="$ctrl.rank.name"
                        />
                        <div ng-if="$ctrl.formFieldHasError('name')">
                            <span ng-if="rankSettings.name.$error.required" class="help-block">名前は必須です。</span>
                            <span ng-if="rankSettings.name.$error.minlength" class="help-block">名前は3文字以上で入力してください。</span>
                            <span ng-if="rankSettings.name.$error.taken" class="help-block">この名前はすでに使用されています。</span>
                        </div>
                    </div>

                    <div ng-if="$ctrl.ladderMode === 'auto'" class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('value')}">
                        <label for="value" class="control-label">{{$ctrl.getValueTypeLabel()}}</label>
                        <input
                            type="number"
                            id="value"
                            name="value"
                            required
                            placeholder="値"
                            class="form-control input-lg"
                            ng-model="$ctrl.rank.value"
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
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function($scope) {
            const $ctrl = this;

            $ctrl.isNewRank = true;

            $ctrl.ladderMode = 'auto';
            $ctrl.ladderSettings = {
                trackBy: 'currency'
            };

            $ctrl.currentRanks = [];

            $ctrl.rank = {
                id: randomUUID(),
                name: "",
                value: undefined
            };

            $ctrl.getValueTypeLabel = () => {
                if ($ctrl.ladderSettings.trackBy === "currency") {
                    return "Required Currency";
                }
                if ($ctrl.ladderSettings.trackBy === "view_time") {
                    return "Required View Time (hrs)";
                }
                if ($ctrl.ladderSettings.trackBy === "metadata") {
                    return $ctrl.ladderSettings.metadataKey ? `Metadata (${$ctrl.ladderSettings.metadataKey})` : 'metadata';
                }
                return "";
            };

            $ctrl.formFieldHasError = (fieldName) => {
                return ($scope.rankSettings.$submitted || $scope.rankSettings[fieldName]?.$touched)
                    && $scope.rankSettings[fieldName]?.$invalid;
            };

            $ctrl.$onInit = () => {
                if ($ctrl.resolve.rank != null) {
                    $ctrl.rank = JSON.parse(angular.toJson($ctrl.resolve.rank));
                    $ctrl.isNewRank = false;
                }
                $ctrl.ladderMode = $ctrl.resolve.ladderMode;
                $ctrl.ladderSettings = $ctrl.resolve.ladderSettings;
                $ctrl.currentRanks = $ctrl.resolve.currentRanks ?? [];
            };

            $ctrl.isNameTaken = (name) => {
                const normalize = str => str.trim().toLowerCase().replace(/\s+/g, "");
                return $ctrl.currentRanks.some(r => normalize(r.name) === normalize(name) && r.id !== $ctrl.rank.id);
            };

            $ctrl.save = () => {
                $scope.rankSettings.$setSubmitted();
                if ($scope.rankSettings.$invalid) {
                    return;
                }

                $ctrl.close({
                    $value: {
                        action: $ctrl.isNewRank ? "add" : "edit",
                        rank: $ctrl.rank
                    }
                });
            };
        }
    });
})();
