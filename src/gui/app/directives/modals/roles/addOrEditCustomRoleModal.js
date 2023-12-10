"use strict";

(function() {

    const uuidv1 = require("uuid/v1");

    angular.module("firebotApp").component("addOrEditCustomRoleModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" ng-click="$ctrl.dismiss()"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="editGroupLabel">{{$ctrl.isNewRole ? "役割を追加" : "役割を編集"}}</h4>
            </div>
            <div class="modal-body">
                <div class="general-group-settings">
                    <div style="display:inline-block;font-size: 14px;font-weight: 500;opacity: 0.7;margin:0;padding:0;text-transform: uppercase;margin-bottom: 1px;margin-left: 10px;">名前</div>
                    <input type="text" class="form-control" ng-model="$ctrl.role.name" placeholder="名前を入力">
                </div>
                <div style="padding-top: 25px;">
                    <div>
                        <div class="settings-title" style="margin-bottom: 4px;display: flex;justify-content: space-between;">
                            <div style="display:flex; align-items: center;">
                                <div style="display:inline-block;font-size: 14px;font-weight: 500;opacity: 0.7;margin:0;padding:0;text-transform: uppercase;margin-bottom: 1px;margin-left: 10px;">視聴者</div>
                                <div class="clickable" ng-click="$ctrl.addViewer()" style="margin-left:6px;font-size: 14px;"><i class="fas fa-plus-circle"></i></div>
                            </div>

                            <div style="display:inline-block; width:50%;position: relative;" ng-show="$ctrl.role.viewers.length > 5 || searchText.length > 0">
                                <input type="text" class="form-control" placeholder="視聴者を検索..." ng-model="searchText" style="height: 30px;padding-left:27px;">
                                <span class="searchbar-icon" style="top:5px;"><i class="far fa-search"></i></span>
                            </div>
                    </div>
                </div>
                <div id="user-list" style="padding-bottom: 20px;">
                    <div style="min-height: 45px;background-color:#282a2e;border-radius:2px;">

                        <div ng-show="$ctrl.role.viewers.length == 0" style="display:flex;height: 45px; align-items: center; justify-content: space-between;padding: 0 15px;">
                            <span class="muted">この役割を持つ視聴者はいません</span>
                        </div>

                        <div ng-repeat="viewer in viewerList = ($ctrl.role.viewers | filter:searchText) | startFrom:($ctrl.pagination.currentPage-1)*$ctrl.pagination.pageSize | limitTo:$ctrl.pagination.pageSize track by $index">
                            <div style="display:flex;height: 45px; align-items: center; justify-content: space-between;padding: 0 15px;">
                                <div style="font-weight: 100;font-size: 16px;">{{viewer}}</div>
                                <span class="delete-button" ng-click="$ctrl.deleteViewer(viewer)">
                                    <i class="far fa-trash-alt"></i>
                                </span>
                            </div>
                        </div>

                    </div>
                    <div ng-show="$ctrl.role.viewers.length > $ctrl.pagination.pageSize" style="text-align: center;">
                        <ul uib-pagination total-items="viewerList.length" ng-model="$ctrl.pagination.currentPage" items-per-page="$ctrl.pagination.pageSize" class="pagination-sm" max-size="5" boundary-link-numbers="true" rotate="true"></ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-if="!$ctrl.isNewRole" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.delete()" uib-tooltip="役割を削除"><i class="fal fa-trash-alt"></i></button>
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function($scope, ngToast, utilityService) {
            const $ctrl = this;

            $ctrl.isNewRole = true;

            $ctrl.role = {
                name: "",
                viewers: []
            };

            $ctrl.pagination = {
                currentPage: 1,
                pageSize: 5
            };

            const findIndexIgnoreCase = (array, element) => {
                if (Array.isArray(array)) {
                    const search = array.findIndex(e => e.toString().toLowerCase() ===
                        element.toString().toLowerCase());
                    return search;
                }
                return -1;
            };

            $ctrl.addViewer = function() {
                utilityService.openViewerSearchModal(
                    {
                        label: "視聴者を追加",
                        saveText: "役割を追加",
                        validationFn: (user) => {
                            return new Promise(resolve => {
                                if (user == null) {
                                    return resolve(false);
                                }
                                if (findIndexIgnoreCase($ctrl.role.viewers, user.username) !== -1) {
                                    return resolve(false);
                                }
                                resolve(true);
                            });
                        },
                        validationText: "視聴者にはすでにこの役割を付与済みです"
                    },
                    (user) => {
                        $ctrl.role.viewers.push(user.username);
                    });
            };

            $ctrl.deleteViewer = function(viewer) {
                utilityService.showConfirmationModal({
                    title: "視聴者を削除",
                    question: `視聴者 ${viewer} の役割を外しますか?`,
                    confirmLabel: "役割を外す",
                    confirmBtnType: "btn-danger"
                }).then(confirmed => {
                    if (confirmed) {
                        $ctrl.role.viewers = $ctrl.role.viewers.filter(v => v !== viewer);
                    }
                });
            };

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.role) {
                    $ctrl.role = JSON.parse(JSON.stringify($ctrl.resolve.role));
                    $ctrl.isNewRole = false;
                }

                const modalId = $ctrl.resolve.modalId;
                utilityService.addSlidingModal(
                    $ctrl.modalInstance.rendered.then(() => {
                        const modalElement = $("." + modalId).children();
                        return {
                            element: modalElement,
                            name: "役割を変更する",
                            id: modalId,
                            instance: $ctrl.modalInstance
                        };
                    })
                );

                $scope.$on("modal.closing", function() {
                    utilityService.removeSlidingModal();
                });

            };

            $ctrl.delete = function() {
                if ($ctrl.isNewRole) {
                    return;
                }

                $ctrl.close({
                    $value: {
                        role: $ctrl.role,
                        action: "delete"
                    }
                });
            };

            $ctrl.save = function() {
                if ($ctrl.role.name == null || $ctrl.role.name.trim() === "") {
                    ngToast.create("役割名を指定してください");
                    return;
                }

                if ($ctrl.isNewRole) {
                    $ctrl.role.id = uuidv1();
                }

                $ctrl.close({
                    $value: {
                        role: $ctrl.role,
                        action: "save"
                    }
                });
            };
        }
    });
}());
