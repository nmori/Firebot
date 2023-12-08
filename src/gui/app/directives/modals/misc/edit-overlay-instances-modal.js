"use strict";

(function() {
    angular.module("firebotApp")
        .component("editOverlayInstancesModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" aria-label="Close" ng-click="$ctrl.dismiss()"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Edit Overlay Instances</h4>
                </div>
                <div class="modal-body">
                    <table class="table table-hover">
                        <thead>
                        <tr>
                            <th>名前</th>
                            <th>URL</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>デフォルト</td>
                            <td><a href ng-click="$ctrl.showViewUrlModal()">閲覧用 URL</a></td>
                            <td></td>
                        </tr>
                        <tr ng-repeat="instanceName in $ctrl.getOverlayInstances()">
                            <td>{{instanceName}}</td>
                            <td><a href ng-click="$ctrl.showViewUrlModal(instanceName)">閲覧用 URL</a></td>
                            <td><span class="effect-delete-btn clickable pull-right" ng-click="$ctrl.deleteOverlayInstanceAtIndex($index)"><i class="far fa-trash-alt"></i></span></td>
                        </tr>
                        </tbody>
                    </table>
                    <button class="btn btn-default btn-sm" ng-click="$ctrl.showCreateInstanceModal()">+ インスタンスを作成</button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.dismiss()">完了</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(settingsService, utilityService) {
                const $ctrl = this;

                $ctrl.getOverlayInstances = () => {
                    return settingsService.getOverlayInstances();
                };

                $ctrl.usingObs = settingsService.getOverlayCompatibility() === "OBS";

                $ctrl.deleteOverlayInstanceAtIndex = (index) => {
                    const instances = settingsService.getOverlayInstances();

                    instances.splice(index, 1);

                    settingsService.setOverlayInstances(instances);
                };

                const addOverlayInstance = (overlayInstance) => {
                    const instances = settingsService.getOverlayInstances();

                    instances.push(overlayInstance);

                    settingsService.setOverlayInstances(instances);
                };

                $ctrl.showViewUrlModal = (instanceName) => {
                    utilityService.showOverlayInfoModal(instanceName);
                };

                $ctrl.showCreateInstanceModal = () => {
                    utilityService.showModal({
                        component: "createOverlayInstancesModal",
                        closeCallback: response => {
                            addOverlayInstance(response.instanceName);
                        }
                    });
                };
            }
        });
}());