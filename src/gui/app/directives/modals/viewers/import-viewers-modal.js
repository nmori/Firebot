"use strict";

(function() {
    angular.module("firebotApp")
        .component("importViewersModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">視聴者をインポート</h4>
                </div>
                <div class="modal-body pb-0">
                    <div ng-hide="$ctrl.viewers">
                        <h4 class="font-semibold">インポート元</h4>
                        <p class="muted mb-12">現在は Streamlabs Chatbot（デスクトップBot）の視聴者のみインポートできます。</p>

                        <h4 class="font-semibold">ファイルを選択</h4>
                        <p class="muted mb-8">Streamlabs Chatbot でエクスポートファイルを取得するには、Connections -> Cloud -> Create Split Excel で [通貨名].xlsx を探すか、Create Excel Files で Data.xlsx を探してください。</p>
                        <file-chooser
                            model="$ctrl.importFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name: 'Microsoft Excel', extensions: '.xlsx'}]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                        <p ng-if="$ctrl.fileError" style="color: #f96f6f;" class="mt-4">このファイルを読み取れません。上記の手順を確認してください。</p>
                    </div>
                    <div ng-show="$ctrl.viewers">
                        <div class="mb-8">
                            <h3>設定</h3>
                            <div class="mt-8">
                                <div class="form-group">
                                    <label class="control-fb control--checkbox"> 視聴時間を含める
                                        <input type="checkbox" ng-model="$ctrl.settings.includeViewHours" ng-click="$ctrl.toggleIncludeViewHours()">
                                        <div class="control__indicator"></div>
                                    </label>
                                    <label ng-if="$ctrl.settings.includeViewHours" class="control-fb control--checkbox"> 視聴時間が 0 の視聴者も含める
                                        <input type="checkbox" ng-model="$ctrl.settings.includeZeroHoursViewers" ng-click="$ctrl.toggleIncludeZeroHoursViewers()">
                                        <div class="control__indicator"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="mt-16 mb-4">
                            <h3>概要</h3>
                            <div class="mb-10 flex flex-row justify-between items-end">
                                <div>
                                    インポート対象の視聴者は {{$ctrl.filteredViewers.length}} 人です。
                                    <tooltip text="'この人数にはユーザー名が変更された視聴者も含まれますが、新しい名前が不明なため実際にはインポートされません。'"></tooltip>
                                </div>
                                <div class="flex justify-between">
                                    <searchbar placeholder-text="視聴者を検索..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
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
                    <button type="button" class="btn btn-link" ng-click="$ctrl.cancelImport()">キャンセル</button>
                    <button ng-show="$ctrl.filteredViewers" ng-click="$ctrl.importViewers()" class="btn btn-primary" ng-disabled="$ctrl.importing || $ctrl.aborting">
                        {{ $ctrl.getButtonText() }}
                    </button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($scope, backendCommunicator, utilityService, importService, logger) {
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

                $ctrl.getButtonText = () => {
                    if ($ctrl.importing) {
                        return "インポート中...";
                    }

                    if ($ctrl.aborting) {
                        return "インポートをキャンセル中...";
                    }

                    return "インポート";
                };

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

                $ctrl.onFileSelected = async (filepath) => {
                    const data = await importService.loadViewers("streamlabs-chatbot", filepath);
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
                        closeCallback: (response) => {
                            if (response.action === "delete") {
                                $ctrl.filteredViewers = $ctrl.filteredViewers.filter(v => v.id !== response.viewer.id);
                                return;
                            }

                            const index = $ctrl.filteredViewers.findIndex(v => v.id === response.viewer.id);
                            $ctrl.filteredViewers[index] = response.viewer;
                        }
                    });
                };

                $ctrl.cancelImport = () => {
                    if (!$ctrl.importing && !$ctrl.aborting) {
                        $ctrl.close();
                        return;
                    }

                    if ($ctrl.importing) {
                        backendCommunicator.onScoped($scope, "import:cleanup-finished", () => {
                            $ctrl.aborting = false;
                            $ctrl.close();
                        });

                        $ctrl.aborting = true;
                        $ctrl.importing = false;

                        backendCommunicator.fireEvent("import:abort-import");
                    }
                };

                $ctrl.importViewers = async () => {
                    const data = {
                        appId: "streamlabs-chatbot",
                        data: $ctrl.filteredViewers,
                        settings: $ctrl.settings
                    };

                    $ctrl.importing = true;
                    /** @type {import("../../../../../types/import").ImportResult} */
                    const response = await backendCommunicator.fireEventAsync("import:import-viewers", data);

                    if (response.success) {
                        logger.debug(`Viewer import completed`);

                        $ctrl.importing = false;
                        $ctrl.close();
                    }
                };
            }
        });
}());