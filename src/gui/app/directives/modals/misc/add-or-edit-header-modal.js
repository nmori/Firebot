"use strict";

(function() {
    angular.module("firebotApp")
        .component("addOrEditHeaderModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">ヘッダーの{{$ctrl.isNew ? '追加' : '編集'}}</h4>
                </div>
                <div class="modal-body">

                    <form name="headerInfo">

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('key')}">
                            <label for="key" class="control-label">Key</label>
                            <input 
                                type="text" 
                                id="key" 
                                name="key" 
                                class="form-control input-lg" 
                                placeholder="キーを入力"
                                ng-model="$ctrl.header.key"
                                ui-validate="'$value != null && $value.length > 0'" 
                                required
                                replace-variables="text"
                                menu-position="under"
                            />
                        </div>

                        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('value')}">
                            <label for="value" class="control-label">Value</label>
                            <input 
                                type="text" 
                                id="value" 
                                name="value" 
                                class="form-control input-lg" 
                                placeholder="値の入力"
                                ng-model="$ctrl.header.value"
                                ui-validate="'$value != null && $value.length > 0'" 
                                required
                                replace-variables="text"
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

                $ctrl.header = {
                    key: null,
                    value: null
                };

                $ctrl.formFieldHasError = (fieldName) => {
                    return ($scope.headerInfo.$submitted || $scope.headerInfo[fieldName].$touched)
                        && $scope.headerInfo[fieldName].$invalid;
                };

                $ctrl.$onInit = () => {
                    $scope.trigger = $ctrl.resolve.trigger;
                    $scope.triggerMeta = $ctrl.resolve.triggerMeta;

                    if ($ctrl.resolve.header != null) {
                        $ctrl.header = JSON.parse(angular.toJson($ctrl.resolve.header));
                        $ctrl.isNew = false;
                    }
                };

                $ctrl.save = () => {
                    $scope.headerInfo.$setSubmitted();
                    if ($scope.headerInfo.$invalid) {
                        return;
                    }

                    $ctrl.close({
                        $value: $ctrl.header
                    });
                };
            }
        });
}());
