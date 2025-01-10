"use strict";

(function() {
    angular
        .module("firebotApp")
        .component("backupsSettings", {
            template: `
                <div>
                    <div><strong>NOTE: These settings affect ALL user profiles.</strong></div>

                    <firebot-setting
                        name="バックアップ上限"
                        description="保持するバックアップの最大数。Firebot が新しいバックアップを作成する際、この数に達した場合は最も古いバックアップを削除します。"
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
                        description="自動バックアップでFirebotが無視する項目を選択します。"
                    >
                        <div>
                        <label class="control-fb control--checkbox"
                            >オーバーレイのデータフォルダを含まない
                            <tooltip
                                text="'overlay-resourceフォルダが非常に大きいためにバックアップシステムの速度が低下している場合は、バックアップ対象から外すことで高速化できます。使う場合はこの機能をオンにしてください。注：手動バックアップは影響を受けません'"
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
                        description="Firebotが自動バックアップを作成するタイミングを選択します。"
                    >
                        <div>
                        <label class="control-fb control--checkbox"
                            >Firebotが終了するとき
                            <input
                                type="checkbox"
                                ng-click="settings.saveSetting('BackupOnExit', !settings.getSetting('BackupOnExit'))"
                                ng-checked="settings.getSetting('BackupOnExit')"
                                aria-label="Automatic update when Firebot closes"
                            />
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >毎日
                            <input
                                type="checkbox"
                                ng-click="settings.saveSetting('BackupOnceADay', !settings.getSetting('BackupOnceADay'))"
                                ng-checked="settings.getSetting('BackupOnceADay')"
                                aria-label="Automatic update Once a day"
                            />
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >視聴者データを消す前
                            <tooltip
                                text="'Firebotは、視聴者データの削除を行う前に常にバックアップを行います。'"
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
                                text="'Firebotはアップデート前に必ずバックアップを取ります。これをオフにすることはできません。これはあなたのためです。'"
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
                        description="バックアップを手動で開始します"
                    >
                        <div>
                            <span
                                ng-if="isBackingUp || backupCompleted"
                                style="padding-left: 10px"
                            >
                                <span ng-if="isBackingUp"> バックアップ中... </span>
                                <span ng-if="backupCompleted" style="color: green">
                                    <i class="fal fa-check-circle"></i> バックアップ完了
                                </span>
                            </span>
                            <firebot-button
                                text="バックアップ開始"
                                ng-click="startBackup()"
                                ng-disabled="isBackingUp"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="バックアップ管理"
                        description="管理状態リストを見たり、データ削除、バックアップから復元する指示ができます。"
                    >
                        <div>
                            <firebot-button
                                text="バックアップの管理"
                                ng-click="backupService.showBackupListModal()"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="Move Backup Folder"
                        description="Choose where Firebot stores backups.">

                        <setting-description-addon>
                            <div style="margin-top: 10px;"><strong>NOTE</strong>: Changing this setting will copy any existing backups from the current location to the new location. This will overwrite any files with the same name in the new location.</div>
                            <div style="margin-top: 10px;">Current backup location: <a ng-click="backupService.openBackupFolder()" ng-bind="backupService.backupFolderPath" href></a></div>
                        </setting-description-addon>

                        <div>
                            <span
                                ng-if="isMovingBackupFolder || backupFolderMoveCompleted"
                                style="padding-left: 10px"
                            >
                                <span ng-if="isMovingBackupFolder"> Moving backups to new folder... </span>
                                <span ng-if="backupFolderMoveCompleted && backupFolderMoveSuccess" style="color: green">
                                    <i class="fal fa-check-circle"></i> Move successful!
                                </span>
                                <span ng-if="backupFolderMoveCompleted && !backupFolderMoveSuccess" style="color: red">
                                    <i class="fal fa-check-circle"></i> Move failed.
                                </span>
                            </span>
                            <firebot-button
                                text="Move Backup Folder"
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

                backendCommunicator.on("backups:backup-complete", (manualActivation) => {
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

                backendCommunicator.on("backups:move-backup-folder-completed", (success) => {
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