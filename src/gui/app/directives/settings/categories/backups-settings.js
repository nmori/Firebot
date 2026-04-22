"use strict";

(function() {
    angular
        .module("firebotApp")
        .component("backupsSettings", {
            template: `
                <div>
                    <div><strong>注: これらの設定はすべてのユーザープロファイルに影響します。</strong></div>

                    <firebot-setting
                        name="バックアップ上限"
                        description="保持するバックアップの最大数です。この数に達している場合、新しいバックアップ作成時に最も古いバックアップが削除されます。"
                    >
                        <dropdown-select
                            ng-init="currentMaxBackups = settings.getSetting('MaxBackupCount')"
                            options="[3,5,10,25,'All']"
                            selected="currentMaxBackups"
                            on-update="settings.saveSetting('MaxBackupCount', option)"
                            aria-label="Choose your Max Number of backups"

                        ></dropdown-select>
                    </firebot-setting>

                    <firebot-setting
                        name="自動バックアップオプション"
                        description="自動バックアップ時に除外する項目を選択します。"
                    >
                        <div>
                        <label class="control-fb control--checkbox"
                            >オーバーレイリソースフォルダを含めない
                            <tooltip
                                text="'overlay-resource フォルダが大きくなってバックアップが遅い場合に有効です。注: 手動バックアップには影響しません。'"
                            ></tooltip>
                            <input
                                type="checkbox"
                                ng-click="settings.saveSetting('BackupIgnoreResources', !settings.getSetting('BackupIgnoreResources'))"
                                ng-checked="settings.getSetting('BackupIgnoreResources')"
                                aria-label="Don't include overlay resource folder in backups"
                            />
                            <div class="control__indicator"></div>
                        </label>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="自動バックアップ"
                        description="Firebot が自動バックアップを作成するタイミングを選択します。"
                    >
                        <div>
                        <label class="control-fb control--checkbox"
                            >Firebot 終了時
                            <input
                                type="checkbox"
                                ng-click="settings.saveSetting('BackupOnExit', !settings.getSetting('BackupOnExit'))"
                                ng-checked="settings.getSetting('BackupOnExit')"
                                aria-label="Automatic update when Firebot closes"
                            />
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >1日1回
                            <input
                                type="checkbox"
                                ng-click="settings.saveSetting('BackupOnceADay', !settings.getSetting('BackupOnceADay'))"
                                ng-checked="settings.getSetting('BackupOnceADay')"
                                aria-label="Automatic update Once a day"
                            />
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >視聴者データ削除前
                            <tooltip
                                text="'視聴者データの削除前には必ずバックアップが作成されます。'"
                            ></tooltip>
                            <input
                                type="checkbox"
                                ng-checked="true"
                                aria-label="Automatic update Before viewer purges. Firebot will always backup before you do viewer purges"
                                disabled
                            />
                            <div class="control__indicator" disabled></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >アップデート前
                            <tooltip
                                text="'アップデート前には必ずバックアップが作成されます。この設定は無効化できません。'"
                            ></tooltip>
                            <input
                                type="checkbox"
                                ng-checked="true"
                                aria-label="Automatic update before updates. This cannot be turned off. It's for your own good <3"
                                disabled
                            />
                            <div class="control__indicator" disabled></div>
                        </label>
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="手動バックアップ"
                        description="今すぐ手動バックアップを実行します。"
                    >
                        <div>
                            <span
                                ng-if="isBackingUp || backupCompleted"
                                style="padding-left: 10px"
                            >
                                <span ng-if="isBackingUp"> バックアップ中... </span>
                                <span ng-if="backupCompleted" style="color: green">
                                    <i class="fal fa-check-circle"></i> バックアップ成功
                                </span>
                            </span>
                            <firebot-button
                                text="今すぐバックアップ"
                                ng-click="startBackup()"
                                ng-disabled="isBackingUp"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="バックアップ管理"
                        description="過去のバックアップの確認、復元、削除を行います。"
                    >
                        <div>
                            <firebot-button
                                text="バックアップを管理"
                                ng-click="backupService.showBackupListModal()"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="バックアップフォルダの移動"
                        description="Firebot がバックアップを保存する場所を選択します。">

                        <setting-description-addon>
                            <div style="margin-top: 10px;"><strong>注</strong>: この設定を変更すると、現在の場所から新しい場所へ既存のバックアップがコピーされます。新しい場所に同名ファイルがある場合は上書きされます。</div>
                            <div style="margin-top: 10px;">現在のバックアップ先: <a ng-click="backupService.openBackupFolder()" ng-bind="backupService.backupFolderPath" href></a></div>
                        </setting-description-addon>

                        <div>
                            <span
                                ng-if="isMovingBackupFolder || backupFolderMoveCompleted"
                                style="padding-left: 10px"
                            >
                                <span ng-if="isMovingBackupFolder"> バックアップを新しいフォルダへ移動中... </span>
                                <span ng-if="backupFolderMoveCompleted && backupFolderMoveSuccess" style="color: green">
                                    <i class="fal fa-check-circle"></i> 移動成功
                                </span>
                                <span ng-if="backupFolderMoveCompleted && !backupFolderMoveSuccess" style="color: red">
                                    <i class="fal fa-check-circle"></i> 移動失敗
                                </span>
                            </span>
                            <firebot-button
                                text="バックアップフォルダを移動"
                                ng-click="backupService.initiateBackupFolderMove()"
                                ng-disabled="isMovingBackupFolder"
                            />
                        </div>
                    </firebot-setting>

                </div>
          `,
            controller: function($scope, settingsService, backupService, backendCommunicator, $timeout) {
                $scope.settings = settingsService;
                $scope.backupService = backupService;

                $scope.startBackup = function() {
                    $scope.isBackingUp = true;
                    $scope.backupCompleted = false;
                    backupService.startBackup();
                };

                backendCommunicator.onScoped($scope, "backups:backup-complete", (manualActivation) => {
                    $scope.isBackingUp = false;

                    if (manualActivation) {
                        // we only want to act if the backup was manually triggered
                        $scope.backupCompleted = true;
                        // after 5 seconds, hide the completed message
                        $timeout(() => {
                            if ($scope.backupCompleted) {
                                $scope.backupCompleted = false;
                            }
                        }, 5000);
                    }
                });

                $scope.moveBackupFolder = () => {
                    $scope.isMovingBackupFolder = true;
                    $scope.backupFolderMoveCompleted = false;
                };

                backendCommunicator.onScoped($scope, "backups:move-backup-folder-completed", (success) => {
                    $scope.isMovingBackupFolder = false;
                    $scope.backupFolderMoveCompleted = true;
                    $scope.backupFolderMoveSuccess = success;

                    // after 5 seconds, hide the completed message
                    $timeout(() => {
                        if ($scope.backupFolderMoveCompleted) {
                            $scope.backupFolderMoveCompleted = false;
                        }
                    }, 5000);
                });
            }
        });
}());