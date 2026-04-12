"use strict";

(function() {
    angular.module("firebotApp")
        .component("importQuotesModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">引用をインポート</h4>
                </div>
                <div class="modal-body pb-0">
                    <div ng-hide="$ctrl.quotes">
                        <h4>インポート元</h5>
                        <div class="muted mb-12">
                            <p class="mb-2">現在は Streamlabs Chatbot（デスクトップBot）、Mix It Up、Firebot の引用をインポートできます。</p>
                            <p>CSV も、以下の順序（1行目はヘッダー）であればインポートできます:</p>
                            <p class="font-bold">
                                ID,
                                引用文,
                                発言者 <tooltip text="'引用されたユーザー。'"></tooltip>,
                                作成者 <tooltip text="'引用を追加したユーザー。'"></tooltip>,
                                ゲーム/カテゴリ,
                                作成日 <tooltip text="'ISO 形式（例: 2025-01-30）。'"></tooltip>
                            </p>
                        </div>

                        <h4>ファイルを選択</h4>
                        <p class="muted mb-2">Streamlabs Chatbot では、Connections -> Cloud -> Create Split Excel から Quotes.xlsx を取得してください。</p>
                        <p class="muted mb-8">Mix It Up では、Quotes -> Export Quotes から Quotes.txt を取得してください。</p>
                        <file-chooser
                            model="$ctrl.importFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name: 'Microsoft Excel', extensions: '.xlsx'}, {name: 'Text File', extensions: '.txt'}, {name: 'CSV File', extensions: '.csv'} ]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                        <p ng-if="$ctrl.fileError" style="color: #f96f6f;" class="mt-4">このファイルを読み取れません。上記の手順を確認してください。</p>
                    </div>
                    <div ng-show="$ctrl.quotes">
                        <div style="margin: 0 0 25px;display: flex;flex-direction: row;justify-content: space-between;align-items: flex-end;">
                            <div>インポート対象の引用は {{$ctrl.quotes.length}} 件です。</div>
                            <div style="display: flex;flex-direction: row;justify-content: space-between;">
                                <searchbar placeholder-text="引用を検索..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                            </div>
                        </div>
                        <sortable-table
                            table-data-set="$ctrl.quotes"
                            headers="$ctrl.headers"
                            query="$ctrl.search"
                            clickable="false"
                            track-by-field="_id"
                            starting-sort-field="_id"
                            no-data-message="引用が見つかりません"
                        >
                        </sortable-table>
                    </div>
                </div>
                <div class="modal-footer pt-0">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button ng-show="$ctrl.quotes" ng-click="$ctrl.importQuotes()" class="btn btn-primary" ng-disabled="$ctrl.importing">
                        {{$ctrl.importing ? 'インポート中...' : 'インポート'}}
                    </button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(backendCommunicator, importService) {
                const $ctrl = this;

                $ctrl.importer = "";
                $ctrl.importing = false;

                $ctrl.headers = [
                    {
                        name: "ID",
                        icon: "fa-id-badge",
                        dataField: "_id",
                        sortable: true,
                        cellTemplate: `{{data._id}}`
                    },
                    {
                        name: "引用文",
                        icon: "fa-quote-right",
                        dataField: "text",
                        cellTemplate: `{{data.text}}`
                    },
                    {
                        name: "発言者",
                        icon: "fa-user",
                        dataField: "originator",
                        headerStyles: {
                            'padding': '0px 15px'
                        },
                        cellStyles: {
                            'padding': '0px 15px'
                        },
                        cellTemplate: `{{data.originator}}`
                    },
                    {
                        name: "作成日",
                        icon: "fa-calendar",
                        dataField: "date",
                        headerStyles: {
                            'padding': '0px 15px'
                        },
                        cellStyles: {
                            'padding': '0px 15px'
                        },
                        cellTemplate: `{{data.createdAt | prettyDate}}`
                    },
                    {
                        name: "ゲーム",
                        icon: "fa-gamepad-alt",
                        dataField: "game",
                        headerStyles: {
                            'width': '175px'
                        },
                        cellStyles: {
                            'width': '175px'
                        },
                        cellTemplate: `{{data.game}}`
                    }
                ];

                $ctrl.onFileSelected = async (filepath) => {
                    //get the file type from the filepath
                    const fileType = filepath.split(".").pop();
                    let data;

                    switch (fileType) {
                        case "xlsx":
                            $ctrl.importer = "streamlabs-chatbot";
                            break;
                        case "txt":
                            $ctrl.importer = "mixitup";
                            break;
                        case "csv":
                            $ctrl.importer = "firebot";
                            break;
                    }

                    data = await importService.loadQuotes($ctrl.importer, filepath);

                    if (data && data.quotes) {
                        $ctrl.quotes = data.quotes;
                        $ctrl.search = "";
                    } else {
                        $ctrl.fileError = true;
                    }
                };

                $ctrl.importQuotes = async () => {
                    $ctrl.importing = true;

                    const result = await backendCommunicator.fireEventAsync("import:import-quotes", {
                        appId: $ctrl.importer,
                        data: $ctrl.quotes,
                        settings: {}
                    });

                    if (result.success) {
                        $ctrl.importing = false;
                        $ctrl.close();
                    }
                };
            }
        });
}());