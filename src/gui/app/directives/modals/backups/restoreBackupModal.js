"use strict";

// Basic template for a modal component, copy this and rename to build a modal.

(function() {
    angular.module("firebotApp").component("restoreBackupModal", {
        template: `
            <div class="modal-header">
                <h4 class="modal-title"></h4>
            </div>
            <div class="modal-body" style="text-align:center;">
                <h1>{{$ctrl.restoreComplete ? 'Restore Complete!' : !$ctrl.restoreHasError ? '復元中...' : 'おおっと!'}}</h1>
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
                    <b>Restore failed because:</b><br>{{$ctrl.errorMessage}}
                </p>
                <p ng-if="$ctrl.restoreHasError" class="muted" style="font-size:12px;">Note: Alternatively, you can manually restore your<br>backup by following <a href="https://github.com/crowbartools/Firebot/wiki/Firebot-V5-Manual-Restore" style="color:#7bddfa;text-decoration:underline;">these steps</a>.</p>
                <p ng-if="$ctrl.restoreComplete">
                    復元が正常に完了しました！ <b>再起動</b> を押してFirebotを再起動してください。再起動すると復元されたデータが読み込まれます。
                </p>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button ng-if="$ctrl.restoreHasError || $ctrl.restoreComplete" class="btn btn-primary" ng-click="$ctrl.exit()">{{$ctrl.restoreComplete ? 'Restart Firebot' : 'Okay'}}</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function($timeout, $q, logger, backupService, listenerService) {
            const $ctrl = this;

            $ctrl.restoreComplete = false;

            $ctrl.restoreHasError = false;
            $ctrl.errorMessage = "";

            $ctrl.exit = function() {
                if ($ctrl.restoreComplete) {
                    listenerService.fireEvent(listenerService.EventType.RESTART_APP);
                } else {
                    $ctrl.modalInstance.dismiss("cancel");
                }
            };

            $ctrl.backupFilePath = null;

            function beginRestore() {
                if ($ctrl.backupFilePath == null || $ctrl.backupFilePath === "") {
                    $ctrl.restoreHasError = true;
                    $ctrl.errorMessage = "指定されたバックアップZIPのパスが有効でないようです。";
                    return;
                }

                $q(async function(resolve) {
                    try {
                        const restoreResult = await backupService.restoreBackup($ctrl.backupFilePath);

                        if (restoreResult.success) {
                            $ctrl.restoreComplete = true;
                        } else {
                            $ctrl.restoreHasError = true;
                            $ctrl.errorMessage = restoreResult.reason;
                        }
                    } catch (error) {
                        logger.error("Unknown error while attempting to restore backup", error);
                        $ctrl.restoreHasError = true;
                        $ctrl.errorMessage = "バックアップを復元しようとして不明なエラーが発生しました。DiscordかX(旧Twitter)でご連絡ください。喜んでお手伝いします！";
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
                        $ctrl.errorMessage = "リストアに時間がかかっています。問題がある可能性があります。一度終了し、再度お試しください。問題が解決しない場合は、DiscordまたはX(旧Twitter)でご連絡ください。喜んでお手伝いします！";
                    }
                }, 30 * 1000);
            };
        }
    });
}());
