"use strict";
(function() {
    //This a wrapped dropdown element that automatically handles the particulars

    angular
        .module("firebotApp")
        .component("notificationCenter", {
            bindings: {},
            template: `
       <div class="notifications-wrapper">
          <div aria-label="���m�点" uib-popover-template="$ctrl.templateUrl" popover-placement="bottom-right" popover-trigger="'outsideClick'" popover-append-to-body="true" popover-class="notification-popover">
            <i class="far fa-bell clickable noti-bell-icon" style="cursor:pointer;"></i>
          </div>
          <div ng-if="$ctrl.unreadCount() > 0" class="notification-badge noselect animated bounceIn">{{getBadgeText()}}</div>
       </div>

       <script type="text/ng-template" id="notificationCenterPopupTemplate.html">

          <div class="notification-popover-header">
            <span>���m�点</span>
          </div>
          <div class="noti-preview-wrapper">
            <div ng-repeat="notification in $ctrl.getNotifications() | orderBy: 'created_at':true track by $index" class="notification-card" ng-click="$ctrl.openNotification(notification)" aria-label="Notification: {{notification.title}}">
              <span class="noti-unread-indicator" ng-class="{'read': notification.read}"></span>
              <span class="noti-icon">
                <i class="fal" ng-class="getIconClass(notification.icon)"></i>
              </span>
              <div class="noti-title-wrapper">
                <span class="noti-icon-text">{{getIconTypeText(notification.icon)}}</span>
                <span class="noti-text">{{notification.title}}</span>
              </div>
              <div class="noti-action" uib-dropdown uib-dropdown-toggle ng-click="$event.stopPropagation();" dropdown-append-to-body="true">
                <span class="noselect pointer"><i class="fal fa-ellipsis-v"></i></span>
                <ul class="dropdown-menu" uib-dropdown-menu>
                  <li><a href ng-click="deleteNotification(notification)" style="color:red;"><i class="far fa-trash-alt"></i> ���m�点�̍폜/a></li>
                </ul>
              </div>
            </div>
            <div ng-if="$ctrl.getNotifications().length < 1" class="no-notifications-card">
              <span class="muted">���m�点�͂���܂���</span>
            </div>
          </div>
        </script>

        <script type="text/ng-template" id="notificationModal.html">
          <div class="modal-header">
            <h4 class="modal-title" style="text-align: center">{{notification.title}}</h4>
          </div>
          <div class="modal-body" style="text-align:center; padding-top:15px">
            <dynamic-element message="notification.message"></dynamic-element>
          </div>
          <div class="modal-footer" style="text-align:center;position: relative;">
            <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>
          </div>
        </script>
       `,
            controller: function(
                $scope,
                notificationService,
                utilityService
            ) {
                const ctrl = this;

                ctrl.notiService = notificationService;

                ctrl.unreadCount = notificationService.getUnreadCount;
                ctrl.getNotifications = notificationService.getNotifications;

                ctrl.templateUrl = "notificationCenterPopupTemplate.html";

                $scope.deleteNotification = notificationService.deleteNotification;

                $scope.getBadgeText = () => {
                    const unreadCount = notificationService.getUnreadCount();

                    if (unreadCount > 9) {
                        return '9+';
                    } else if (unreadCount < 0) {
                        return "!";
                    }
                    return unreadCount.toString();
                };

                $scope.getIconTypeText = function(iconType) {
                    const NotificationIconType = notificationService.NotificationIconType;
                    switch (iconType) {
                    case NotificationIconType.UPDATE:
                        return "�A�b�v�f�[�g";
                    case NotificationIconType.ALERT:
                        return "�ʒm";
                    case NotificationIconType.TIP:
                        return "�q���g";
                    case NotificationIconType.INFO:
                    default:
                        return "���";
                    }
                };

                $scope.getIconClass = function(iconType) {
                    const NotificationIconType = notificationService.NotificationIconType;
                    let iconClass = "";
                    switch (iconType) {
                        case NotificationIconType.UPDATE:
                            iconClass = "download";
                            break;
                        case NotificationIconType.ALERT:
                            iconClass = "exclamation-circle";
                            break;
                        case NotificationIconType.TIP:
                            iconClass = "question-circle";
                            break;
                        case NotificationIconType.INFO:
                        default:
                            iconClass = "info-circle";
                    }
                    return `fa-${iconClass}`;
                };

                ctrl.openNotification = function(notification, index) {
                    notificationService.markNotificationAsRead(notification, index);
                    const justUpdatedModalContext = {
                        templateUrl: "notificationModal.html",
                        size: "sm",
                        resolveObj: {
                            notification: () => notification,
                            index: () => index
                        },
                        controllerFunc: (
                            $scope,
                            $uibModalInstance,
                            notification
                        ) => {
                            $scope.notification = notification;

                            $scope.ok = function() {
                                $uibModalInstance.dismiss("cancel");
                            };
                        }
                    };
                    utilityService.showModal(justUpdatedModalContext);
                };
            }
        })
        .directive("dynamicElement", [
            "$compile",
            function($compile) {
                return {
                    restrict: "E",
                    scope: {
                        message: "="
                    },
                    replace: true,
                    link: function(scope, element) {
                        const htmlWrap = `<div style="width:100%; height: 100%; position: relative;">${
                            scope.message
                        }</div>`.trim();

                        const el = angular.element(htmlWrap);
                        const template = $compile(el)(scope);
                        element.replaceWith(template);
                    },
                    controller: [
                        "$scope",
                        "$rootScope",
                        function($scope, $rootScope) {
                            $scope.$rootScope = $rootScope;
                        }
                    ]
                };
            }
        ]);
}());
