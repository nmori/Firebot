'use strict';

(function() {
    angular
        .module('firebotApp')
        .component("fontManagementModal", {
            template: `
            <div class="modal-header flex-row-center jspacebetween">
                <h4 class="modal-title" style="display:inline;">フォント管理</h4>
            </div>
            <div class="modal-body">
                <div class="list-group" style="margin-bottom: 0;">
                    <span class="muted" ng-show="$ctrl.fonts.length === 0">カスタムフォントはインストールされていません。</span>
                    <div class="list-group-item flex-row-center jspacebetween" ng-repeat="font in $ctrl.fonts track by $index">
                        <div>
                            <h4 class="list-group-item-heading">{{font.name}}</h4>
                            <p class="list-group-item-text muted">Format: {{font.format}}</p>
                        </div>
                        <div style="font-size:17px">
                            <span uib-tooltip="フォントを削除" tooltip-append-to-body="true" class="clickable" style="color:red;" ng-click="$ctrl.removeFont(font.name)">
                                <i class="fas fa-trash-alt"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div style="color: #fb7373;" ng-if="$ctrl.installError">{{$ctrl.installError}}</div>
                <div style="color: green;text-align: center;padding-top: 5px;" ng-if="$ctrl.installSuccessful">フォントをインストールしました！</div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-default pull-left" ng-click="$ctrl.openFileExplorer()">フォントをインストール</button>
                <button class="btn btn-primary" ng-click="$ctrl.dismiss()">閉じる</button>
            </div>
            `,
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            },
            controller: function(backendCommunicator, fontManager) {
                const $ctrl = this;

                $ctrl.installError = null;
                $ctrl.installSuccessful = false;

                $ctrl.fonts = fontManager.getInstalledFonts();

                $ctrl.removeFont = async (name) => {
                    try {
                        await fontManager.removeFont(name);
                        $ctrl.fonts = fontManager.getInstalledFonts();
                    } catch (error) {
                        $ctrl.installError = `フォント削除時にエラーが発生しました: ${error.message}`;
                    }
                };

                $ctrl.openFileExplorer = async () => {
                    $ctrl.installError = null;
                    $ctrl.installSuccessful = null;
                    const response = await backendCommunicator.fireEventAsync("open-file-browser", {
                        options: {
                            title: 'フォントファイルを選択',
                            filters: [
                                {
                                    name: 'フォント', extensions: ['ttf', 'woff', 'woff2', 'otf']
                                }
                            ]
                        }
                    });

                    if (response?.path?.length) {
                        const success = await fontManager.installFont(response.path);

                        if (success) {
                            $ctrl.fonts = fontManager.getInstalledFonts();
                            $ctrl.installSuccessful = true;
                        } else {
                            $ctrl.installError = "フォントのインストールに失敗しました。詳細はログを確認してください。";
                        }
                    }
                };
            }
        });
}());