"use strict";

(function() {
    angular.module("firebotApp")
        .component("importQuotesModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">引用文の取り込み</h4>
                </div>
                <div class="modal-body pb-0">
                    <div ng-hide="$ctrl.quotes">
                        <h4>Import from</h5>
                        <p class="muted mb-12">現在取り込みできるのは、Streamlabs Chatbot（デスクトップBOT）とMix It Upからの引用のみです。</p>

                        <h4>Choose file</h4>
                        <p class="muted mb-2">Streamlabs Chatbotで取り込み用ファイルを取得するには、Connections -> Cloud -> Create Split ExcelでQuotes.xlsxというファイルを見つけます。</p>
                        <p class="muted mb-8"Mix It Upで取り込み用ファイルを入手するには、Quotes -> Export Quotesと進み、Quotes.txtというファイルを見つけます。</p>
                        <file-chooser
                            model="$ctrl.importFilePath"
                            on-update="$ctrl.onFileSelected(filepath)"
                            options="{filters: [ {name: 'Microsoft Excel', extensions: '.xlsx'}, {name: 'Text File', extensions: '.txt'} ]}"
                            hide-manual-edit="true"
                        >
                        </file-chooser>
                        <p ng-if="$ctrl.fileError" style="color: #f96f6f;" class="mt-4">このファイルを読み込めません。上記の指示に従ってください。</p>
                    </div>
                    <div ng-show="$ctrl.quotes">
                        <div style="margin: 0 0 25px;display: flex;flex-direction: row;justify-content: space-between;align-items: flex-end;">
                            <div>{{$ctrl.quotes.length}} 件の引用文がみつかりました。</div>
                            <div style="display: flex;flex-direction: row;justify-content: space-between;">
                                <searchbar placeholder-text="引用文を検索中..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                            </div>
                        </div>
                        <sortable-table
                            table-data-set="$ctrl.quotes"
                            headers="$ctrl.headers"
                            query="$ctrl.search"
                            clickable="false"
                            track-by-field="_id"
                            starting-sort-field="_id"
                            no-data-message="引用文が見つかりません"
                        >
                        </sortable-table>
                    </div>
                </div>
                <div class="modal-footer pt-0">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button ng-show="$ctrl.quotes" ng-click="$ctrl.importQuotes()" class="btn btn-primary">取り込み開始</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(backendCommunicator, quotesService, importService) {
                const $ctrl = this;

                $ctrl.headers = [
                    {
                        name: "ID",
                        icon: "fa-id-badge",
                        dataField: "_id",
                        sortable: true,
                        cellTemplate: `{{data._id}}`
                    },
                    {
                        name: "QUOTE",
                        icon: "fa-quote-right",
                        dataField: "text",
                        cellTemplate: `{{data.text}}`
                    },
                    {
                        name: "DATE",
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
                        name: "GAME",
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

                $ctrl.onFileSelected = (filepath) => {
                    //get the file type from the filepath
                    const fileType = filepath.split(".").pop();
                    let data;
                    if (fileType === "xlsx") {
                        data = importService.parseStreamlabsChatbotData(filepath);
                    } else if (fileType === "txt") {
                        data = importService.parseMixItUpData(filepath, "quotes");
                    }
                    if (data && data.quotes) {
                        $ctrl.quotes = data.quotes;
                        $ctrl.search = "";
                    } else {
                        $ctrl.fileError = true;
                    }
                };

                $ctrl.importQuotes = () => {
                    quotesService.addQuotes($ctrl.quotes);
                };

                backendCommunicator.on("quotes-update", () => {
                    $ctrl.close();
                });
            }
        });
}());
