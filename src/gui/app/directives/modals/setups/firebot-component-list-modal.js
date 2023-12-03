"use strict";

(function() {
    angular.module("firebotApp")
        .component("firebotComponentListModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.label}}</h4>
                </div>
                <div class="modal-body">
                    <div id="roles" class="modal-subheader" style="padding: 0 0 4px 0">
                        {{$ctrl.label}}
                    </div>
                    <div class="viewer-group-list" style="height: inherit; min-height: 100px;max-height: 300px;">
                        <label ng-repeat="component in $ctrl.allComponents track by component.id" class="control-fb control--checkbox">{{component.name}}
                            <input type="checkbox" ng-click="$ctrl.toggleComponentSelected(component.id)" ng-checked="$ctrl.componentIsSelected(component.id)"  aria-label="..." >
                            <div class="control__indicator"></div>
                        </label>
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
            controller: function() {
                const $ctrl = this;

                $ctrl.label = "";
                $ctrl.allComponents = [];
                $ctrl.selectedIds = [];

                $ctrl.componentIsSelected = (id) => $ctrl.selectedIds.includes(id);
                $ctrl.toggleComponentSelected = (id) => {
                    const index = $ctrl.selectedIds.findIndex(i => i === id);
                    if (index < 0) {
                        $ctrl.selectedIds.push(id);
                    } else {
                        $ctrl.selectedIds.splice(index, 1);
                    }
                };

                $ctrl.$onInit = () => {
                    $ctrl.label = $ctrl.resolve.label || "";

                    if ($ctrl.resolve.allComponents) {
                        $ctrl.allComponents = $ctrl.resolve.allComponents;
                    }

                    if ($ctrl.resolve.selectedIds) {
                        $ctrl.selectedIds = $ctrl.resolve.selectedIds;
                    }
                };

                $ctrl.save = () => {
                    $ctrl.close({
                        $value: JSON.parse(angular.toJson($ctrl.selectedIds))
                    });
                };
            }
        });
}());
