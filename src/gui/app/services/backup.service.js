"use strict";

(function() {
    const { basename, dirname, sep, resolve } = require('path');
    const { mkdirSync, readFileSync, writeFileSync } = require("fs-extra");
    const fs = require("fs-extra");
    const empty = require("empty-folder");
    const { unzipSync } = require('fflate');

    angular
        .module("firebotApp")
        .factory("backupService", function($q, logger, backendCommunicator, listenerService,
            dataAccess, utilityService) {
            const service = {};

            const RESTORE_FOLDER_PATH = dataAccess.getPathInTmpDir("/restore");
            const USER_DATA_FOLDER_PATH = dataAccess.getPathInUserData("/");
            const PROFILES_FOLDER_PATH = dataAccess.getPathInUserData("/profiles");
            const BACKUPS_FOLDER_PATH = resolve(`${dataAccess.getUserDataPath() + sep}backups`) + sep;

            service.BACKUPS_FOLDER_PATH = BACKUPS_FOLDER_PATH;

            service.startBackup = function() {
                listenerService.fireEvent(listenerService.EventType.INITIATE_BACKUP, true);
            };

            service.openBackupZipFilePicker = function() {
                return $q.when(backendCommunicator.fireEventAsync("open-file-browser", {
                    options: {
                        title: "バックアップデータ(zip)の選択",
                        buttonLabel: "バックアップデータの選択",
                        filters: [{ name: "Zip", extensions: ["zip"] }]
                    },
                    currentPath: BACKUPS_FOLDER_PATH
                }))
                    .then(response => {
                        if (response == null || response.path == null) {
                            return null;
                        }

                        return response.path;
                    });
            };

            service.initiateBackupRestore = function(backupFilePath) {
                utilityService.showModal({
                    component: "restoreBackupModal",
                    keyboard: false,
                    backdrop: "static",
                    size: "sm",
                    resolveObj: {
                        backupFilePath: () => backupFilePath
                    }
                });
            };

            function validateBackupZip(backupFilePath) {
                let hasProfilesDir = false;
                let hasGlobalSettings = false;

                const unzippedData = unzipSync(readFileSync(backupFilePath));

                for (const [filepath] of Object.entries(unzippedData)) {
                    if (filepath.includes('profiles')) {
                        if (hasGlobalSettings) {
                            return true;
                        }
                        hasProfilesDir = true;
                    } else if (basename(filepath).toLowerCase() === 'global-settings.json') {
                        if (hasProfilesDir) {
                            return true;
                        }
                        hasGlobalSettings = true;
                    }
                }
                return false;
            }

            function clearRestoreFolder() {
                return new Promise(resolve => {
                    empty(RESTORE_FOLDER_PATH, false, o => {
                        if (o.error) {
                            logger.warn(o.error);
                        }
                        resolve();
                    });
                });
            }

            function extractBackupZip(backupFilePath) {
                mkdirSync(RESTORE_FOLDER_PATH, { recursive: true });

                const unzippedData = unzipSync(readFileSync(backupFilePath));
                for (const [filepath, bytes] of Object.entries(unzippedData)) {
                    if (filepath.endsWith('/')) {
                        continue;
                    }

                    const writeFilePath = resolve(`${RESTORE_FOLDER_PATH}/${filepath}`);
                    mkdirSync(dirname(writeFilePath), { recursive: true });
                    writeFileSync(writeFilePath, bytes);
                }
            }

            function clearProfilesFolder() {
                return new Promise((resolve, reject) => {
                    empty(PROFILES_FOLDER_PATH, false, o => {
                        if (o.error) {
                            logger.error(o.error);
                            return reject();
                        }
                        resolve();
                    });
                });
            }

            function copyRestoreFilesToUserData() {
                return new Promise((resolve, reject) => {
                    fs.copy(RESTORE_FOLDER_PATH, USER_DATA_FOLDER_PATH, { errorOnExist: false }, function(err) {
                        if (err) {
                            logger.error("Failed to copy backup data!");
                            logger.error(err);
                            reject();
                        } else {
                            logger.info('Copied backup data');
                            resolve();
                        }
                    });
                });
            }


            service.restoreBackup = async (backupFilePath) => {

                // Validate backup zip
                try {
                    const valid = await validateBackupZip(backupFilePath);
                    if (!valid) {
                        return {
                            success: false,
                            reason: "このzipファイルは有効なFirebot V5のバックアップではありません。"
                        };
                    }
                } catch (error) {
                    return {
                        success: false,
                        reason: "zipファイルの検証に失敗しました。ファイルが壊れているかもしれません"
                    };
                }

                // Clear out the /restore folder
                await clearRestoreFolder();

                // Extract the backup zip to the /restore folder
                await extractBackupZip(backupFilePath);

                // Clear out the profiles folder
                try {
                    await clearProfilesFolder();
                } catch (error) {
                    return {
                        success: false,
                        reason: "プロファイルフォルダのクリアに失敗しました"
                    };
                }

                try {
                    await copyRestoreFilesToUserData();
                } catch (error) {
                    return {
                        success: false,
                        reason: "バックアップデータを書き戻すのに失敗しました"
                    };
                }

                return {
                    success: true
                };
            };

            return service;
        });
}());
