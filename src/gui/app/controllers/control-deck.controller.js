"use strict";

(function() {
    angular
        .module("firebotApp")
        .controller("controlDeckController", function($scope, controlDeckService, settingsService) {
            $scope.controlDeckService = controlDeckService;

            $scope.controlDeckEnabled = () => {
                return settingsService.getSetting("ControlDeckEnabled");
            };

            $scope.enableControlDeck = () => {
                settingsService.saveSetting("ControlDeckEnabled", true);
            };

            $scope.headers = [
                {
                    name: "名前",
                    icon: "fa-grid",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`
                },
                {
                    name: "コントロール",
                    icon: "fa-hashtag",
                    dataField: "controls",
                    cellTemplate: `{{data.controls.length}} 個のコントロール`
                },
                {
                    cellTemplate: `<span ng-if="isDefault" uib-tooltip="デバイスでコントロールデッキを開いたときに最初に表示されるデッキです" append-tooltip-to-body="true"><span class="paused-dot unpaused" style="margin-right: 5px"></span> 既定</span>`,
                    cellController: ($scope, settingsService) => {
                        $scope.isDefault = false;

                        function checkIfDefault() {
                            $scope.isDefault = $scope.data.id === settingsService.getSetting("ControlDeckDefaultDeckId");
                        }

                        checkIfDefault();

                        $scope.$watch(() => settingsService.getSetting("ControlDeckDefaultDeckId"), checkIfDefault);
                    }
                }
            ];

            $scope.deckOptions = (item) => {
                return [
                    {
                        html: `<a href><i class="far fa-pen mr-2 text-center" style="width: 20px;"></i> 編集</a>`,
                        click: () => {
                            controlDeckService.showAddEditDeckModal(item);
                        }
                    },
                    {
                        html: `<a href><i class="far fa-star mr-2 text-center" style="width: 20px;"></i> 既定に設定</a>`,
                        click: () => {
                            settingsService.saveSetting("ControlDeckDefaultDeckId", item.id);
                        },
                        enabled: item.id !== settingsService.getSetting("ControlDeckDefaultDeckId")
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt text-center mr-2" style="width: 20px;"></i> 削除</a>`,
                        click: () => {
                            controlDeckService.confirmDeleteDeck(item);
                        }
                    }
                ];
            };
        });
}());
