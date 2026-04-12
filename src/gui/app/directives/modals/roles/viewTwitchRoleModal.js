"use strict";

(function() {
    angular.module("firebotApp").component("viewTwitchRoleModal", {
        template: `
            <div class="modal-header">
                <button type="button" class="close" aria-label="閉じる" ng-click="$ctrl.dismiss()"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="editGroupLabel">{{$ctrl.role.name}}{{$ctrl.role.id === "broadcaster" ? "" : "s"}}</h4>
            </div>
            <div class="modal-body">
                <div class="settings-title flex justify-between mb-2">
                    <div class="flex items-center">
                        <div class="uppercase m-0 ml-4 p-0" style="font-size: 14px;opacity: 0.7;">視聴者</div>
                        <div ng-if="$ctrl.editable" class="clickable ml-2 text-2xl" ng-click="$ctrl.addViewer()"><i class="fas fa-plus-circle"></i></div>
                    </div>

                    <div class="inline-block relative" style="width: 50%;" ng-show="$ctrl.viewers.length > 10 || searchText.length > 0">
                        <input type="text" class="form-control pl-12" placeholder="視聴者を検索" ng-model="searchText" style="height: 30px;">
                        <span class="searchbar-icon" style="top:5px;"><i class="far fa-search"></i></span>
                    </div>
                </div>

                <div id="user-list">
                    <div style="min-height: 40px;background-color:#282a2e;border-radius:8px;">

                        <div ng-show="$ctrl.viewers.length == 0" class="flex items-center justify-between px-4" style="height: 40px">
                            <span class="muted">このロールのユーザーはいません。</span>
                        </div>

                        <div ng-repeat="viewer in viewerList = ($ctrl.viewers | filter:searchText) | startFrom:($ctrl.pagination.currentPage-1)*$ctrl.pagination.pageSize | limitTo:$ctrl.pagination.pageSize track by $index">
                            <div class="flex items-center justify-between px-4" style="height: 40px;">
                                <div class="font-thin text-2xl">{{viewer.displayName||viewer.username}}</div>
                                <span ng-if="$ctrl.editable" class="delete-button" ng-click="$ctrl.deleteViewer(viewer)">
                                    <i class="far fa-trash-alt"></i>
                                </span>
                            </div>
                        </div>

                    </div>
                    <div ng-show="$ctrl.viewers.length > $ctrl.pagination.pageSize" class="text-center">
                        <ul uib-pagination total-items="viewerList.length" ng-model="$ctrl.pagination.currentPage" items-per-page="$ctrl.pagination.pageSize" class="pagination-sm mb-0" max-size="3" boundary-link-numbers="true" rotate="true"></ul>
                    </div>
                </div>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function(viewerRolesService, utilityService) {
            const $ctrl = this;

            $ctrl.pagination = {
                currentPage: 1,
                pageSize: 10
            };

            $ctrl.$onInit = () => {
                if ($ctrl.resolve.role) {
                    $ctrl.role = JSON.parse(JSON.stringify($ctrl.resolve.role));

                    $ctrl.viewers = viewerRolesService.getViewersForTwitchRole($ctrl.role.id);
                    $ctrl.editable = $ctrl.role.id === "vip" || $ctrl.role.id === "mod";
                }
            };

            $ctrl.addViewer = () => {
                utilityService.openViewerSearchModal(
                    {
                        label: `${$ctrl.role.name} を追加`,
                        description: `この視聴者にTwitchで ${$ctrl.role.name} ロールを付与します。`,
                        saveText: "追加",
                        validationFn: async (user) => {
                            if (user == null || $ctrl.viewers.map(v => v.id).includes(user.id)) {
                                return false;
                            }

                            return true;
                        },
                        validationText: "この視聴者は既にこのロールを持っています。"
                    },
                    (user) => {
                        $ctrl.viewers.push({
                            id: user.id,
                            username: user.username,
                            displayName: user.displayName
                        });

                        if ($ctrl.role.id === "mod") {
                            viewerRolesService.updateModRoleForUser(user.username, true);
                        }

                        if ($ctrl.role.id === "vip") {
                            viewerRolesService.updateVipRoleForUser(user.username, true);
                        }
                    });
            };

            $ctrl.deleteViewer = (user) => {
                utilityService.showConfirmationModal({
                    title: "ロールを解除",
                    question: `Twitch上で ${user.displayName} の ${$ctrl.role.name} ロールを解除します。続行しますか？`,
                    confirmLabel: "解除",
                    confirmBtnType: "btn-danger"
                }).then((confirmed) => {
                    if (confirmed) {
                        $ctrl.viewers = $ctrl.viewers.filter(v => v.id !== user.id);

                        if ($ctrl.role.id === "mod") {
                            viewerRolesService.updateModRoleForUser(user.username, false);
                        }

                        if ($ctrl.role.id === "vip") {
                            viewerRolesService.updateVipRoleForUser(user.username, false);
                        }
                    }
                });
            };
        }
    });
}());
