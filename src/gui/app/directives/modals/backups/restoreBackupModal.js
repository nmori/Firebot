"use strict";

// Basic template for a modal component, copy this and rename to build a modal.

(function() {
    angular.module("firebotApp").component("restoreBackupModal", {
        template: `
            <div class="modal-header">
                <h4 class="modal-title"></h4>
            </div>
            <div class="modal-body" style="text-align:center;">
                <h1>{{$ctrl.restoreComplete ? '復元完了！' : !$ctrl.restoreHasError ? '復元中...' : '問題が発生しました'}}</h1>
                <div style="overflow: hidden;" ng-hide="$ctrl.restoreComplete || $ctrl.restoreHasError">
                    <div class="loader">読み込み中...</div>
                </div>
                <div ng-if="$ctrl.restoreHasError" style="height: 220px;display:flex;justify-content:center;align-items:center;">
                    <i class="fad fa-sad-tear" style="font-size: 150px;"></i>
                </div>
                <div ng-if="$ctrl.restoreComplete" style="height: 220px;display:flex;justify-content:center;align-items:center;">
                    <i class="fad fa-check-circle" style="font-size: 150px; color:lightgreen"></i>
                </div>
                <p ng-if="$ctrl.restoreHasError" style="color:#ed5e5e;">
                    <b>復元に失敗しました:</b><br>{{$ctrl.errorMessage}}
                </p>
                <p ng-if="$ctrl.restoreHasError" class="muted" style="font-size:12px;">補足: <a href="https://github.com/nmori/Firebot/wiki/Firebot-V5-Manual-Restore" style="color:#7bddfa;text-decoration:underline;">こちらの手順</a>に従って<br>手動復元することも可能です。</p>
                <p ng-if="$ctrl.restoreComplete">
                    復元が完了しました。下の <b>Firebotを再起動</b> をクリックして再起動してください。復元したデータを正しく読み込むために必要です。
                </p>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button ng-if="$ctrl.restoreHasError || $ctrl.restoreComplete" class="btn btn-primary" ng-click="$ctrl.exit()">{{$ctrl.restoreComplete ? 'Firebotを再起動' : 'OK'}}</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function($timeout, $q, logger, backupService, backendCommunicator) {
            const $ctrl = this;

            $ctrl.restoreComplete = false;

            $ctrl.restoreHasError = false;
            $ctrl.errorMessage = "";

            $ctrl.exit = function() {
                if ($ctrl.restoreComplete) {
                    backendCommunicator.send("restartApp");
                } else {
                    $ctrl.modalInstance.dismiss("cancel");
                }
            };

            $ctrl.backupFilePath = null;

            function beginRestore() {
                if ($ctrl.backupFilePath == null || $ctrl.backupFilePath === "") {
                    $ctrl.restoreHasError = true;
                    $ctrl.errorMessage = "指定されたバックアップzipのパスが無効です。";
                    return;
                }

                $q(async function(resolve) {
                    try {
                        const restoreResult = await backupService.restoreBackup($ctrl.backupFilePath);

                        if (restoreResult.success) {
                            $ctrl.restoreComplete = true;
                            $ctrl.restoreHasError = false;
                            $ctrl.errorMessage = undefined;
                        } else {
                            $ctrl.restoreHasError = true;
                            $ctrl.errorMessage = restoreResult.reason;
                        }
                    } catch (error) {
                        logger.error("Unknown error while attempting to restore backup", error);
                        $ctrl.restoreHasError = true;
                        $ctrl.errorMessage = "バックアップ復元中に不明なエラーが発生しました。Discord または Bluesky でご連絡ください。喜んでサポートします。";
                    }
                    resolve();
                });
            }

            $ctrl.$onInit = function() {
                $ctrl.backupFilePath = $ctrl.resolve.backupFilePath;

                $timeout(beginRestore, 1000);

                $timeout(() => {
                    if (!$ctrl.restoreComplete && !$ctrl.restoreHasError) {
                        $ctrl.restoreHasError = true;
                        $ctrl.errorMessage = "復元に通常より時間がかかっています。問題が発生している可能性があります。いったん閉じて再試行してください。解決しない場合は Discord または Bluesky でご連絡ください。";
                    }
                }, 60 * 1000);
            };
        }
    });
}());