"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("chatUserCategory", {
            bindings: {
                category: "@",
                roleKey: "@"
            },
            template: `
            <div
                ng-show="filtered != null && filtered.length > 0"
                style="margin-bottom:15px;"
            >
                <div style="font-size: 12px; opacity: 0.6;">{{$ctrl.category}}</div>
                <div
                    class="chat-user-wrapper"
                    ng-repeat="user in cms.getFilteredChatUserList() | chatUserRole:$ctrl.roleKey | orderBy:'displayName':true | orderBy:'active':true as filtered track by user.id"
                >
                    <div class="chat-user-img-wrapper">
                        <img ng-src="{{user.profilePicUrl}}" />
                        <span
                            class="chat-user-status"
                            ng-class="{ active: user.active }"
                            uib-tooltip="{{user.active ? 'アクティブ' : '非アクティブ'}}"
                            tooltip-append-to-body="true"
                        ></span>
                        </div>
                    <div
                        class="chat-user-name clickable"
                        ng-click="showUserDetailsModal(user.id)"
                        uib-tooltip="{{user.userName}}"
                        >
                        {{user.displayName}}
                   </div>
                </div>
            </div>
            `,
            controller: function($scope, chatMessagesService, utilityService) {

                $scope.cms = chatMessagesService;

                $scope.showUserDetailsModal = (userId) => {
                    if (userId == null) {
                        return;
                    }

                    const closeFunc = () => {};
                    utilityService.showModal({
                        component: "viewerDetailsModal",
                        backdrop: true,
                        resolveObj: {
                            userId: () => userId
                        },
                        closeCallback: closeFunc,
                        dismissCallback: closeFunc
                    });
                };
            }
        });
}());
