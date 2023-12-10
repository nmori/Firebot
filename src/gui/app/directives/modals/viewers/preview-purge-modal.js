"use strict";

(function() {

    angular.module("firebotApp")
        .component("previewPurgeModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">プレビューを削除</h4>
            </div>
            <div class="modal-body">
                <div style="margin: 0 0 25px;display: flex;flex-direction: row;justify-content: space-between;">
                    <div style="display: flex;flex-direction: row;justify-content: space-between;">
                        <searchbar placeholder-text="視聴者を探す..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                    </div>
                </div>
                <sortable-table
                    table-data-set="$ctrl.viewers"
                    headers="$ctrl.headers"
                    query="$ctrl.search"
                    clickable="false"
                    track-by-field="_id"
                    starting-sort-field="username"
                    no-data-message="基準を満たした視聴者はいません”>
                </sortable-table>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button type="button" class="btn btn-primary" ng-click="$ctrl.close()">戻る</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function() {
                const $ctrl = this;

                $ctrl.search = "";

                $ctrl.viewers = [];

                $ctrl.$onInit = function() {
                    if ($ctrl.resolve.viewers) {
                        $ctrl.viewers = $ctrl.resolve.viewers;
                    }
                };

                $ctrl.headers = [
                    {
                        name: "視聴者名",
                        icon: "fa-user",
                        dataField: "username",
                        headerStyles: {
                            'min-width': '125px'
                        },
                        sortable: true,
                        cellTemplate: `{{data.displayName || data.username}}`,
                        cellController: () => {}
                    },
                    {
                        name: "最終訪問",
                        icon: "fa-eye",
                        dataField: "lastSeen",
                        sortable: true,
                        cellTemplate: `{{data.lastSeen | prettyDate}}`,
                        cellController: () => {}
                    },
                    {
                        name: "視聴時間(時間)",
                        icon: "fa-tv",
                        dataField: "minutesInChannel",
                        sortable: true,
                        cellTemplate: `{{getViewTimeDisplay(data.minutesInChannel)}}`,
                        cellController: ($scope) => {
                            $scope.getViewTimeDisplay = (minutesInChannel) => {
                                return minutesInChannel < 60 ? '1時間以内' : Math.round(minutesInChannel / 60);
                            };
                        }
                    },
                    {
                        name: "チャット",
                        icon: "fa-comments",
                        dataField: "chatMessages",
                        sortable: true,
                        cellTemplate: `{{data.chatMessages}}`,
                        cellController: () => {}
                    }
                ];
            }
        });
}());
