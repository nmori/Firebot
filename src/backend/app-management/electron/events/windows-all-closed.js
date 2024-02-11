"use strict";

const { app } = require("electron");

exports.windowsAllClosed = async () => {

    const logger = require("../../../logwrapper");
    logger.debug("All windows closed triggered");

    const { settings } = require("../../../common/settings-access");
    const backupManager = require("../../../backup-manager");

    // Stop all scheduled tasks
    const scheduledTaskManager = require("../../../timers/scheduled-task-manager");
    scheduledTaskManager.stop();

    // Unregister all shortcuts.
    const hotkeyManager = require("../../../hotkeys/hotkey-manager");
    hotkeyManager.unregisterAllHotkeys();

    // Stop the chat moderation service
    const chatModerationManager = require("../../../chat/moderation/chat-moderation-manager");
    chatModerationManager.stopService();

    // Persist custom variables
    if (settings.getPersistCustomVariables()) {
        const customVariableManager = require("../../../common/custom-variable-manager");
        customVariableManager.persistVariablesToFile();
    }

    // Set all users to offline
    const viewerOnlineStatusManager = require("../../../viewers/viewer-online-status-manager");
    await viewerOnlineStatusManager.setAllViewersOffline();

    if (settings.backupOnExit()) {
        // Make a backup
        await backupManager.startBackup(false, app.quit);
    } else {
        app.quit();
    }
};