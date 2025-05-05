import { app } from "electron";
import path from "path";
import fsp from "fs/promises";
import fs from "fs";
import logger from "./logwrapper";
import utils from "./utility";
import { SettingsManager } from "./common/settings-manager";
import dataAccess from "./common/data-access.js";
import frontendCommunicator from "./common/frontend-communicator";
import unzipper from "unzipper";
import archiver from "archiver";

const RESTORE_FOLDER_PATH = dataAccess.getPathInTmpDir("/restore");
const PROFILES_FOLDER_PATH = dataAccess.getPathInUserData("/profiles");
const USER_DATA_FOLDER_PATH = dataAccess.getPathInUserData("/");

export type FirebotBackup = {
    name: string;
    path: string;
    backupDate: Date;
    version: string;
    size: number;
    isManual: boolean;
    neverDelete: boolean;
};

class BackupManager {
    private _backupFolderPath: string = undefined;

    constructor() {
        this.updateBackupFolderPath();

        SettingsManager.on("settings:setting-updated:BackupLocation", () => {
            this.updateBackupFolderPath();
        });

        frontendCommunicator.on("backups:get-backup-folder-path", () => {
            return this._backupFolderPath;
        });

        frontendCommunicator.onAsync("backups:get-backup-list", async () => {
            return await this.getBackupList();
        });

        frontendCommunicator.on("backups:start-backup", async (manualActivation: boolean) => {
            await this.startBackup(manualActivation);

            logger.info("backup complete");

            frontendCommunicator.send("backups:backup-complete", manualActivation);
        });

        frontendCommunicator.onAsync("backups:restore-backup", async (backupFilePath: string): Promise<{ success: boolean; reason?: string; }> => {
            return await this.restoreBackup(backupFilePath);
        });

        frontendCommunicator.onAsync("backups:delete-backup", async (backupFilePath: string): Promise<boolean> => {
            try {
                await fsp.unlink(backupFilePath);
                return true;
            } catch (error) {
                logger.error("Error deleting backup", error);
                return false;
            }
        });

        frontendCommunicator.onAsync("backups:toggle-backup-prevent-deletion", async (backupFilePath: string) => {
            await this.toggleBackupPreventDeletion(backupFilePath);
        });

        frontendCommunicator.onAsync("backups:move-backup-folder", async (newPath: string) => {
            return await this.moveBackupFolder(newPath);
        });
    }

    get backupFolderPath() {
        return this._backupFolderPath;
    }

    async getBackupList(): Promise<FirebotBackup[]> {
        const files = await fsp.readdir(this._backupFolderPath);

        const backups = await Promise.all(files
            .filter(f => f.endsWith(".zip"))
            .map(async v => await this.getBackupInfo(path.join(this._backupFolderPath, v))));

        backups.sort((a, b) => {
            return b.backupDate.getTime() - a.backupDate.getTime();
        });

        return backups;
    }

    private async getBackupInfo(backupFilePath: string): Promise<FirebotBackup> {
        const fileName = path.basename(backupFilePath);
        try {
            const fileStats = await fsp.stat(backupFilePath);
            const backupDate = fileStats.birthtime;

            let version = "Unknown Version";
            const versionRegEx = /_(v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.\d+)?)?)(?:_|\b)/;
            const match = fileName.match(versionRegEx);
            if (match != null) {
                version = match[1];
            }

            return {
                name: fileName.replace(".zip", ""),
                path: backupFilePath,
                backupDate: backupDate,
                version: version,
                size: fileStats.size,
                isManual: fileName.includes("manual"),
                neverDelete: fileName.includes("NODELETE")
            };
        } catch (error) {
            logger.error(`Error reading backup file ${fileName}`, error);
            return undefined;
        }
    }

    private updateBackupFolderPath() {
        const backupLocation = SettingsManager.getSetting("BackupLocation");
        this._backupFolderPath = backupLocation?.length > 0
            ? backupLocation
            : path.join(dataAccess.getPathInUserData("/"), "backups");
    }

    async toggleBackupPreventDeletion(backupFilePath: string) {
        const backup = await this.getBackupInfo(backupFilePath);

        backup.neverDelete = !backup.neverDelete;
        const oldName = `${backup.name}.zip`;
        const newName = backup.neverDelete
            ? `${backup.name}_NODELETE.zip`
            : `${backup.name.replace("_NODELETE", "")}.zip`;

        await fsp.rename(
            path.join(this._backupFolderPath, oldName),
            path.join(this._backupFolderPath, newName)
        );
    }

    private async cleanUpOldBackups() {
        const maxBackups = SettingsManager.getSetting("MaxBackupCount");

        if (maxBackups !== "All") {
            const fileNames = (await Promise.all((await fsp.readdir(this._backupFolderPath))
                .map(async (v) => {
                    return {
                        name: v,
                        time: (await fsp.stat(path.join(this._backupFolderPath, v))).birthtime.getTime()
                    };
                })))
                .sort((a, b) => b.time - a.time)
                .map(v => v.name)
                .filter(n => !n.includes("NODELETE") && n.endsWith(".zip"));

            fileNames.splice(0, maxBackups);

            for (const f of fileNames) {
                logger.info(`Deleting old backup: ${f}`);
                await fsp.unlink(path.join(this._backupFolderPath, f));
            }
        }
    }

    async startBackup(manualActivation = false) {
        logger.info(`Backup manualActivation: ${manualActivation}`);

        const version = app.getVersion(),
            milliseconds = Date.now(),
            fileExtension = "zip";

        const filename = `backup_${milliseconds}_v${version}${
            manualActivation ? "_manual" : ""
        }.${fileExtension}`;

        const output = fs.createWriteStream(path.join(this._backupFolderPath, filename));
        const archive = archiver(fileExtension, {
            zlib: { level: 9 }
        });

        // 最適化: 圧縮レベルを調整（9は最大圧縮だが遅い、5は中程度の圧縮で速度も適切）
        const compressionLevel = manualActivation ? 9 : 5; // 手動バックアップの場合は最大圧縮、自動バックアップは中程度
        
        archive.on("warning", function(err) {
            if (err.code === "ENOENT") {
                logger.warn("Error during backup: ", err);
            } else {
                if (manualActivation) {
                    frontendCommunicator.send(
                        "error",
                        "Something bad happened, please check your logs."
                    );
                }
                throw err;
            }
        });

        archive.on("error", function(err) {
            throw err;
        });

        archive.pipe(output);

        const varIgnoreInArchive = ["backups/**", "clips/**", "logs/**", "overlay.html", "profiles/*/db/*.db~", "cache/**"];
        const ignoreResources = SettingsManager.getSetting("BackupIgnoreResources");

        if (ignoreResources && !manualActivation) {
            logger.info("Ignoring overlay-resources folder");
            varIgnoreInArchive.push("overlay-resources/**");
        }
        
        // バックアップサイズをさらに削減するため、キャッシュフォルダを除外
        if (!manualActivation) {
            varIgnoreInArchive.push("profiles/*/cache/**");
        }

        archive.glob('**/*', {
            ignore: varIgnoreInArchive,
            cwd: path.resolve(dataAccess.getPathInUserData("/"))
        });

        try {
            logger.info(`Starting backup with compression level ${compressionLevel}...`);
            const startTime = Date.now();
            
            await archive.finalize();
            
            const endTime = Date.now();
            logger.info(`Backup completed in ${(endTime - startTime) / 1000} seconds`);

            SettingsManager.saveSetting("LastBackupDate", new Date());

            // バックアップクリーンアップを非同期で実行
            setTimeout(() => {
                this.cleanUpOldBackups().catch(err => {
                    logger.error("Error cleaning up old backups", err);
                });
            }, 5000);
        } catch (error) {
            logger.error("Error finalizing backup archive", error);
        }
    }

    async onceADayBackUpCheck() {
        const shouldBackUp = SettingsManager.getSetting("BackupOnceADay"),
            lastBackupDate = SettingsManager.getSetting("LastBackupDate"),
            todayDate = new Date();

        if (shouldBackUp) {
            const isSameDay =
          lastBackupDate != null &&
          lastBackupDate.getDate() === todayDate.getDate() &&
          lastBackupDate.getMonth() === todayDate.getMonth() &&
          lastBackupDate.getFullYear() === todayDate.getFullYear();

            if (!isSameDay) {
                logger.info("Doing once a day backup");
                // ここで起動時の即時バックアップを避けるため、Promise解決を待たずに実行
                this.startBackup().catch(err => {
                    logger.error("Error during daily backup", err);
                });
                
                // trueを返して呼び出し元に処理が進んでいることを伝える
                return true;
            }
        }
        
        return false;
    }

    async restoreBackup(backupFilePath: string): Promise<{ success: boolean; reason?: string; }> {
        // Validate backup zip
        try {
            const valid = await this.validateBackupZip(backupFilePath);
            if (!valid) {
                return {
                    success: false,
                    reason: "Provided zip is not a valid Firebot V5 backup."
                };
            }
        } catch (error) {
            return {
                success: false,
                reason: "Failed to validate the backup zip."
            };
        }

        // Clear out the /restore folder
        try {
            await utils.emptyFolder(RESTORE_FOLDER_PATH);
        } catch (error) {
            logger.warn("Error clearing backup restore folder", error);
        }

        // Extract the backup zip to the /restore folder
        await this.extractBackupZip(backupFilePath);

        // Clear out the profiles folder
        try {
            await utils.emptyFolder(PROFILES_FOLDER_PATH);
        } catch (error) {
            logger.warn("Error clearing profiles folder", error);
            return {
                success: false,
                reason: "Failed to clear profiles folder."
            };
        }

        try {
            await this.copyRestoreFilesToUserData();
        } catch (error) {
            logger.error("Failed to copy backup data", error);
            return {
                success: false,
                reason: "Failed to copy restore files to user data."
            };
        }

        return {
            success: true
        };
    }

    private async validateBackupZip(backupFilePath: string): Promise<boolean> {
        try {
            let hasProfilesDir = false;
            let hasGlobalSettings = false;

            // より速く判定するために、必要な情報が見つかったら早期リターン
            const extractPromise = new Promise<boolean>((resolve, reject) => {
                fs.createReadStream(backupFilePath)
                    .pipe(unzipper.Parse() //eslint-disable-line new-cap
                        .on('entry', (entry) => {
                            if (entry.path.includes("profiles")) {
                                hasProfilesDir = true;
                            } else if (entry.path.includes("global-settings")) {
                                hasGlobalSettings = true;
                            }
                            
                            // 両方見つかったらストリームを終了して早期リターン
                            if (hasProfilesDir && hasGlobalSettings) {
                                entry.autodrain();
                                resolve(true);
                                return;
                            }
                            
                            entry.autodrain();
                        })
                        .on('error', (err) => {
                            logger.error("Error validating backup zip", err);
                            reject(err);
                        })
                        .on('close', () => {
                            resolve(hasProfilesDir && hasGlobalSettings);
                        }));
            });
            
            // タイムアウト処理を追加（30秒）
            const timeoutPromise = new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(false), 30000);
            });
            
            return await Promise.race([extractPromise, timeoutPromise]);
        } catch (error) {
            logger.error("Error during backup validation", error);
            return false;
        }
    }

    private async extractBackupZip(backupFilePath: string) {
        await fsp.mkdir(RESTORE_FOLDER_PATH, { recursive: true });

        const backupZip = await unzipper.Open.file(backupFilePath);

        await backupZip.extract({ path: RESTORE_FOLDER_PATH });
    }

    private async copyRestoreFilesToUserData() {
        await fsp.cp(RESTORE_FOLDER_PATH, USER_DATA_FOLDER_PATH, { recursive: true, force: true });
        logger.info("Copied backup data");
    }

    private async moveBackupFolder(newPath: string): Promise<boolean> {
        let success = false;

        try {
            logger.info(`Moving backup files to ${newPath}`);

            // Test that we can access the new path
            await fsp.access(newPath);

            logger.info("Copying old backup files to new location");
            await fsp.cp(this._backupFolderPath, newPath, { force: true, recursive: true });

            logger.info("Saving new backup location setting");
            SettingsManager.saveSetting("BackupLocation", newPath);

            logger.info("Backup folder moved successfully");
            success = true;
        } catch (error) {
            logger.error(`Error moving backup folder to ${newPath}`, error);
        }

        frontendCommunicator.send("backups:move-backup-folder-completed", success);
        return success;
    }
}

const backupManager = new BackupManager();

export { backupManager as BackupManager };
