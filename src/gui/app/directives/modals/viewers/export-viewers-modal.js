"use strict";

(function() {
    angular.module("firebotApp")
        .component("exportViewersModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">視聴者をエクスポート</h4>
                </div>
                <div class="modal-body">
                    <h4 class="font-semibold">カテゴリを選択</h4>
                    <p class="muted">各カテゴリは、データがある場合に個別ファイルとしてエクスポートされます。</p>
                    <div class="form-group">
                        <label class="control-fb control--checkbox"> 視聴者
                            <input type="checkbox" ng-model="$ctrl.exportOptions.viewers" ng-click="$ctrl.toggleExportViewers()">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"> 通貨
                            <input type="checkbox" ng-model="$ctrl.exportOptions.currencies" ng-click="$ctrl.toggleExportCurrencies()">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"> ランク
                            <input type="checkbox" ng-model="$ctrl.exportOptions.ranks" ng-click="$ctrl.toggleExportRanks()">
                            <div class="control__indicator"></div>
                        </label>
                    </div>

                    <div class="mt-14">
                        <h4 class="font-semibold">フォルダを選択</h4>
                        <p class="muted">ファイルの保存先です。</p>
                        <file-chooser
                            model="$ctrl.folderpath"
                            options="{ directoryOnly: true, filters: [], title: 'フォルダを選択'}"
                        />
                    </div>
                </div>
                <div class="modal-footer pt-0">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button ng-click="$ctrl.exportViewers()" class="btn btn-primary" ng-disabled="$ctrl.exporting">
                        {{$ctrl.exporting ? 'エクスポート中...' : 'エクスポート'}}
                    </button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(backendCommunicator, logger) {
                const $ctrl = this;

                $ctrl.folderpath = "";
                $ctrl.exportOptions = {
                    viewers: true,
                    currencies: true,
                    ranks: true
                };

                $ctrl.toggleExportViewers = () => {
                    $ctrl.exportOptions.viewers = !$ctrl.exportOptions.viewers;
                };

                $ctrl.toggleExportCurrencies = () => {
                    $ctrl.exportOptions.currencies = !$ctrl.exportOptions.currencies;
                };

                $ctrl.toggleExportRanks = () => {
                    $ctrl.exportOptions.ranks = !$ctrl.exportOptions.ranks;
                };

                $ctrl.exportViewers = async () => {
                    $ctrl.exporting = true;

                    const success = await backendCommunicator.fireEventAsync("export-viewers", {
                        folderpath: $ctrl.folderpath, exportOptions: $ctrl.exportOptions 
                    });

                    if (success) {
                        logger.debug(`Viewer export completed`);

                        $ctrl.exporting = false;
                        $ctrl.close({
                            $value: {
                                success: success
                            }
                        });
                    }
                };
            }
        });
}());