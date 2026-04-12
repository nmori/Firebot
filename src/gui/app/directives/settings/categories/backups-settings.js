"use strict";

<<<<<<< HEAD
(function() {

    const moment = require("moment");
    const path = require("path");
    const fs = require("fs");

=======
(function () {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    angular
        .module("firebotApp")
        .component("backupsSettings", {
            template: `
                <div>
<<<<<<< HEAD
=======
                    <div><strong>注：これらの設定は、すべてのユーザープロファイルに影響します。</strong></div>
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20

                    <firebot-setting
                        name="バックアップ上限"
                        description="保持するバックアップの最大数。Firebot が新しいバックアップを作成する際、この数に達した場合は最も古いバックアップを削除します。"
                    >
                        <dropdown-select
                            ng-init="currentMaxBackups = settings.maxBackupCount()"
                            options="[3,5,10,25,'All']"
                            selected="currentMaxBackups"
                            on-update="settings.setMaxBackupCount(option)"
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
                                ng-click="settings.setBackupIgnoreResources(!settings.backupIgnoreResources())"
                                ng-checked="settings.backupIgnoreResources()"
                                aria-label="..."
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
                                ng-click="settings.setBackupOnExit(!settings.backupOnExit())"
                                ng-checked="settings.backupOnExit()"
                                aria-label="..."
                            />
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox"
                            >毎日
                            <input
                                type="checkbox"
                                ng-click="settings.setBackupOnceADay(!settings.backupOnceADay())"
                                ng-checked="settings.backupOnceADay()"
                                aria-label="..."
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
                                aria-label="..."
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
                                aria-label="..."
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
<<<<<<< HEAD
                                ng-click="showBackupListModal()"
=======
                                ng-click="backupService.showBackupListModal()"
                            />
                        </div>
                    </firebot-setting>

                    <firebot-setting
                        name="バックアップフォルダの指定"
                        description="Firebot がバックアップを保存する場所を選択します。">

                        <setting-description-addon>
                            <div style="margin-top: 10px;"><strong>メモ</strong>: この設定を変更すると、既存のバックアップが現在の場所から新しい場所にコピーされます。これにより、新しい場所にある同じ名前のファイルが上書きされます。</div>
                            <div style="margin-top: 10px;">現在のバックアップ先： <a ng-click="backupService.openBackupFolder()" ng-bind="backupService.backupFolderPath" href></a></div>
                        </setting-description-addon>

                        <div>
                            <span
                                ng-if="isMovingBackupFolder || backupFolderMoveCompleted"
                                style="padding-left: 10px"
                            >
                                <span ng-if="isMovingBackupFolder"> バックアップを新しいフォルダに移動中... </span>
                                <span ng-if="backupFolderMoveCompleted && backupFolderMoveSuccess" style="color: green">
                                    <i class="fal fa-check-circle"></i> 移動に成功しました
                                </span>
                                <span ng-if="backupFolderMoveCompleted && !backupFolderMoveSuccess" style="color: red">
                                    <i class="fal fa-check-circle"></i> 移動に失敗しました
                                </span>
                            </span>
                            <firebot-button
                                text="移動する"
                                ng-click="backupService.initiateBackupFolderMove()"
                                ng-disabled="isMovingBackupFolder"
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                            />
                        </div>
                    </firebot-setting>

                </div>
          `,
<<<<<<< HEAD
            controller: function($scope, settingsService, backupService, backendCommunicator, $timeout, utilityService) {
=======
            controller: function ($scope, settingsService, backupService, backendCommunicator, $timeout) {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                $scope.settings = settingsService;

                $scope.startBackup = function () {
                    $scope.isBackingUp = true;
                    $scope.backupCompleted = false;
                    backupService.startBackup();
                };

                backendCommunicator.on("backupComplete", (manualActivation) => {
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

<<<<<<< HEAD
                $scope.showBackupListModal = function() {
                    const showBackupListModalContext = {
                        templateUrl: "backupListModal.html",
                        size: "sm",
                        controllerFunc: (
                            $scope,
                            $uibModalInstance,
                            $q,
                            listenerService,
                            utilityService,
                            dataAccess
                        ) => {
                            $scope.backups = [];

                            const backupFolderPath = path.resolve(`${dataAccess.getUserDataPath() + path.sep}backups`) + path.sep;

                            $scope.loadingBackups = true;
                            $q
                                .when(
                                    new Promise(resolve => {
                                        fs.readdir(backupFolderPath, (err, files) => {
                                            const backups = files
                                                .filter(f => f.endsWith(".zip"))
                                                .map(function(v) {
                                                    const fileStats = fs.statSync(backupFolderPath + v);
                                                    const backupDate = moment(fileStats.birthtime);

                                                    let version = "不明なバージョン";
                                                    const versionRe = /_(v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.\d+)?)?)(?:_|\b)/;
                                                    const match = v.match(versionRe);
                                                    if (match != null) {
                                                        version = match[1];
                                                    }

                                                    return {
                                                        name: v.replace(".zip", ""),
                                                        backupTime: backupDate.toDate().getTime(),
                                                        backupDateDisplay: backupDate.format(
                                                            "MMM Do, A h:mm"
                                                        ),
                                                        backupDateFull: backupDate.format(
                                                            "YYYY/MMM/ddd Do, A h:mm:ss"
                                                        ),
                                                        fromNowDisplay: utilityService.capitalize(
                                                            backupDate.fromNow()
                                                        ),
                                                        dayDifference: moment().diff(backupDate, "days"),
                                                        version: version,
                                                        size: Math.round(fileStats.size / 1000),
                                                        isManual: v.includes("manual"),
                                                        neverDelete: v.includes("NODELETE")
                                                    };
                                                })
                                                .sort(function(a, b) {
                                                    return b.backupTime - a.backupTime;
                                                });

                                            resolve(backups);
                                        });
                                    })
                                )
                                .then(backups => {
                                    $scope.loadingBackups = false;
                                    $scope.backups = backups;
                                });

                            $scope.togglePreventDeletion = function(backup) {
                                backup.neverDelete = !backup.neverDelete;
                                const oldName = `${backup.name}.zip`;
                                backup.name = backup.neverDelete
                                    ? (backup.name += "_NODELETE")
                                    : backup.name.replace("_NODELETE", "");

                                fs.renameSync(
                                    backupFolderPath + oldName,
                                    `${backupFolderPath + backup.name}.zip`
                                );
                            };

                            $scope.deleteBackup = function(index, backup) {
                                utilityService
                                    .showConfirmationModal({
                                        title: "バックアップ削除",
                                        question: "このバックアップデータを削除しますか?",
                                        confirmLabel: "削除実行"
                                    })
                                    .then(confirmed => {
                                        if (confirmed) {
                                            $scope.backups.splice(index, 1);
                                            fs.unlinkSync(`${backupFolderPath + backup.name}.zip`);
                                        }
                                    });
                            };

                            $scope.restoreBackup = function(backup) {
                                utilityService
                                    .showConfirmationModal({
                                        title: "バックアップから復元",
                                        question: "バックアップデータから復元をしますか?",
                                        confirmLabel: "復元開始"
                                    })
                                    .then(confirmed => {
                                        if (confirmed) {
                                            $uibModalInstance.dismiss("cancel");

                                            const backupFilePath =
                                                path.join(backupService.BACKUPS_FOLDER_PATH, `${backup.name}.zip`);

                                            backupService.initiateBackupRestore(backupFilePath);
                                        }
                                    });
                            };

                            $scope.openBackupFolder = function() {
                                listenerService.fireEvent(listenerService.EventType.OPEN_BACKUP);
                            };

                            $scope.dismiss = function() {
                                $uibModalInstance.dismiss("cancel");
                            };
                        }
                    };
                    utilityService.showModal(showBackupListModalContext);
=======
                $scope.moveBackupFolder = () => {
                    $scope.isMovingBackupFolder = true;
                    $scope.backupFolderMoveCompleted = false;
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                };

            }
        });
}());
