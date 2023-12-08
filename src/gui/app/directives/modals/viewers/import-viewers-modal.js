"use strict";

(function() {
    angular.module("firebotApp")
        .component("importViewersModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">視聴者の取り込み</h4>
                </div>
                <div class="modal-body pb-0">
                    <div ng-hide="$ctrl.viewers">
                        <h4 class="font-semibold">取り込み元</h4>
                        <p class="muted mb-12">現在、Streamlabs Chatbot（デスクトップBot）からのみ取り込み可能です。</p>

                        <h4 class="font-semibold">ファイルの選択</h4>
                        <p class="muted mb-8">Streamlabs Chatbotでエクスポートファイルを取得するには、Connections -> Cloud -> Create Split Excelで[通貨名].xlsxというファイルを見つけるか、Create Excel Filesを選択してData.xlsxというファイルを見つけます。</p>
                        <file-chooser
                            model="$ctrl.importFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name: 'Microsoft Excel', extensions: '.xlsx'}]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                        <p ng-if="$ctrl.fileError" style="color: #f96f6f;" class="mt-4">このファイルを読み込めません。上記の指示に従ってください。</p>
                    </div>
                    <div ng-show="$ctrl.viewers">
                        <div class="mb-8">
                            <h3>Settings</h3>
                            <div class="mt-8">
                                <div class="form-group">
                                    <label class="control-fb control--checkbox"> 表示時間を含む
                                        <input type="checkbox" ng-model="$ctrl.settings.includeViewHours" ng-click="$ctrl.toggleIncludeViewHours()">
                                        <div class="control__indicator"></div>
                                    </label>
                                    <label ng-if="$ctrl.settings.includeViewHours" class="control-fb control--checkbox"> 視聴時間のない視聴者を含む
                                        <input type="checkbox" ng-model="$ctrl.settings.includeZeroHoursViewers" ng-click="$ctrl.toggleIncludeZeroHoursViewers()">
                                        <div class="control__indicator"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="mt-16 mb-4">
                            <h3>Overview</h3>
                            <div class="mb-10 flex flex-row justify-between items-end">
                                <div>
                                    {{$ctrl.filteredViewers.length}} 人の視聴者を取り込めます.
                                    <tooltip text="'ユーザー名を変更した視聴者は新しい名前が不明なのでうまく取り込めません。'"></tooltip>
                                </div>
                                <div class="flex justify-between">
                                    <searchbar placeholder-text="視聴者を探す..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                                </div>
                            </div>
                            <sortable-table
                                table-data-set="$ctrl.filteredViewers"
                                headers="$ctrl.headers"
                                query="$ctrl.search"
                                clickable="true"
                                on-row-click="$ctrl.showEditImportedViewerModal(data)"
                                track-by-field="name"
                                starting-sort-field="viewHours"
                                sort-initially-reversed="true"
                                no-data-message="視聴者が見つかりません"
                            >
                            </sortable-table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer pt-0">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button ng-show="$ctrl.filteredViewers" ng-click="$ctrl.importViewers()" class="btn btn-primary" ng-disabled="$ctrl.importing">
                        {{$ctrl.importing ? '取り込み中...' : '取り込みを開始'}}
                    </button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(backendCommunicator, utilityService, importService, logger) {
                const $ctrl = this;

                $ctrl.settings = {
                    includeViewHours: true,
                    includeZeroHoursViewers: true
                };

                $ctrl.headers = [
                    {
                        name: "USERNAME",
                        icon: "fa-user",
                        dataField: "name",
                        sortable: true,
                        cellTemplate: `{{data.name}}`
                    },
                    {
                        name: "VIEW HOURS",
                        icon: "fa-tv",
                        dataField: "viewHours",
                        sortable: true,
                        headerStyles: {
                            'width': '125px'
                        },
                        cellStyles: {
                            'width': '125px'
                        },
                        cellTemplate: `{{data.viewHours}}`
                    },
                    {
                        headerStyles: {
                            'width': '15px'
                        },
                        cellStyles: {
                            'width': '15px'
                        },
                        sortable: false,
                        cellTemplate: `<i class="fal fa-chevron-right"></i>`
                    }
                ];

                $ctrl.toggleIncludeViewHours = () => {
                    $ctrl.settings.includeViewHours = !$ctrl.settings.includeViewHours;
                };

                $ctrl.toggleIncludeZeroHoursViewers = () => {
                    $ctrl.settings.includeZeroHoursViewers = !$ctrl.settings.includeZeroHoursViewers;

                    if (!$ctrl.settings.includeZeroHoursViewers) {
                        $ctrl.filteredViewers = $ctrl.viewers.filter(v => parseInt(v.viewHours) !== 0);
                    } else {
                        $ctrl.filteredViewers = $ctrl.viewers;
                    }
                };

                $ctrl.onFileSelected = (filepath) => {
                    const data = importService.parseStreamlabsChatbotData(filepath);
                    if (data && data.viewers) {
                        $ctrl.viewers = data.viewers;
                        $ctrl.search = "";

                        $ctrl.filteredViewers = $ctrl.viewers;
                    } else {
                        $ctrl.fileError = true;
                    }
                };

                $ctrl.showEditImportedViewerModal = (viewer) => {
                    utilityService.showModal({
                        component: "editImportedViewerModal",
                        size: "sm",
                        resolveObj: {
                            viewer: () => viewer
                        },
                        closeCallback: response => {
                            if (response.action === "delete") {
                                $ctrl.filteredViewers = $ctrl.filteredViewers.filter(v => v.id !== response.viewer.id);
                                return;
                            }

                            const index = $ctrl.filteredViewers.findIndex(v => v.id === response.viewer.id);
                            $ctrl.filteredViewers[index] = response.viewer;
                        }
                    });
                };

                $ctrl.importViewers = async () => {
                    const data = {
                        viewers: $ctrl.filteredViewers,
                        settings: $ctrl.settings
                    };

                    $ctrl.importing = true;
                    const success = await backendCommunicator.fireEventAsync("importSlcbViewers", data);

                    if (success) {
                        logger.debug(`Viewer import completed`);

                        $ctrl.importing = false;
                        $ctrl.close();
                    }
                };
            }
        });
}());
