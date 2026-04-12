"use strict";
const { BrowserWindow, BrowserView, Menu, shell, dialog, nativeImage } = require("electron");
const path = require("path");
const url = require("url");
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");
const windowStateKeeper = require("electron-window-state");

const { BackupManager } = require("../../backup-manager");
const { SettingsManager } = require("../../common/settings-manager");
const { createTray } = require('./tray-creation.js');
const fileOpenHelpers = require("../file-open-helpers");
const screenHelpers = require("./screen-helpers");
const frontendCommunicator = require("../../common/frontend-communicator");
const logger = require("../../logwrapper");

const EventEmitter = require("events");

const { copyDebugInfoToClipboard } = require("../../common/debug-info");

/**
 * Firebot's main window
 * Keeps a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 *@type {Electron.BrowserWindow}
 */
let mainWindow = null;

/**
 * @type {import("tiny-typed-emitter").TypedEmitter<{
*    "main-window-closed": () => void;
*  }>}
*/
exports.events = new EventEmitter();

// hold a reference to the effect queue monitor window module
const { createEffectQueueMonitorWindow, getEffectQueueMonitorWindow } = require("./windows/effect-queue-monitor-window");

const argv = require('../../common/argv-parser');

setupTitlebar();

/**
 *@type {Electron.BrowserWindow}
 */
let variableInspectorWindow = null;

async function createVariableInspectorWindow() {
    if (variableInspectorWindow != null && !variableInspectorWindow.isDestroyed()) {
        if (variableInspectorWindow.isMinimized()) {
            variableInspectorWindow.restore();
        }
        variableInspectorWindow.focus();
        return;
    }

    const variableInspectorWindowState = windowStateKeeper({
        defaultWidth: 720,
        defaultHeight: 1280,
        file: "variable-inspector-window-state.json"
    });

    variableInspectorWindow = new BrowserWindow({
        frame: true,
        alwaysOnTop: true,
        backgroundColor: "#2F3137",
        title: "Custom Variable Inspector",
        parent: mainWindow,
        width: variableInspectorWindowState.width,
        height: variableInspectorWindowState.height,
        x: variableInspectorWindowState.x,
        y: variableInspectorWindowState.y,
        webPreferences: {
            preload: path.join(__dirname, "../../../gui/variable-inspector/preload.js")
        },
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png")
    });
    variableInspectorWindow.setMenu(null);

    variableInspectorWindowState.manage(variableInspectorWindow);

    variableInspectorWindow.on("close", () => {
        variableInspectorWindow = null;
    });

    global.variableInspectorWindow = variableInspectorWindow;

    await variableInspectorWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "../../../gui/variable-inspector/index.html"),
            protocol: "file:",
            slashes: true
        }));

    await variableInspectorWindow.on("close", () => {
        variableInspectorWindow.destroy();
        global.variableInspectorWindow = null;
    });
}


/**
 * The stream preview popout window.
 * Keeps a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 *@type {Electron.BrowserWindow}
 */
let streamPreview = null;

function createStreamPreviewWindow() {

    if (streamPreview != null && !streamPreview.isDestroyed()) {
        if (streamPreview.isMinimized()) {
            streamPreview.restore();
        }
        streamPreview.focus();
        return;
    }

    const { AccountAccess } = require("../../common/account-access");
    const streamer = AccountAccess.getAccounts().streamer;

    if (!streamer.loggedIn) {
        return;
    }

    const streamPreviewWindowState = windowStateKeeper({
        defaultWidth: 815,
        defaultHeight: 480,
        file: "stream-preview-window-state.json"
    });

    streamPreview = new BrowserWindow({
        frame: true,
        alwaysOnTop: true,
        backgroundColor: "#1E2023",
        title: "Stream Preview",
        parent: mainWindow,
        width: streamPreviewWindowState.width,
        height: streamPreviewWindowState.height,
        x: streamPreviewWindowState.x,
        y: streamPreviewWindowState.y,
        javascript: false,
        webPreferences: {},
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png")
    });
    streamPreview.setBounds({
        height: streamPreviewWindowState.height || 480,
        width: streamPreviewWindowState.width || 815
    }, false);
    streamPreview.setMenu(null);

    const view = new BrowserView();
    streamPreview.setBrowserView(view);
    view.setBounds({
        x: 0,
        y: 0,
        width: streamPreview.getContentSize()[0],
        height: streamPreview.getContentSize()[1]
    });
    view.setAutoResize({
        width: true,
        height: true
    });
    view.webContents.on('new-window', (vEvent) => {
        vEvent.preventDefault();
    });

    view.webContents.loadURL(`https://player.twitch.tv/?channel=${streamer.username}&parent=firebot&muted=true`);

    streamPreviewWindowState.manage(streamPreview);

    streamPreview.on("close", () => {
        if (!view.webContents.isDestroyed()) {
            view.webContents.destroy();
        }
    });
}

async function createIconImage(relativeIconPath) {
    const iconPath = path.resolve(__dirname, relativeIconPath);
    if (process.platform === "darwin") {
        try {
            return await nativeImage.createThumbnailFromPath(iconPath, {
                width: 14,
                height: 14
            });
        } catch (e) {
            logger.error(`Failed to create icon image for path: ${relativeIconPath}`, relativeIconPath, e);
            return;
        }
    }
    return iconPath;
}

async function createAppMenu() {
    const { ProfileManager } = require("../../common/profile-manager");
    const dataAccess = require("../../common/data-access");

    const overlayInstances = SettingsManager.getSetting("OverlayInstances");

    /**
     * Steps to get new icon images:
     * - Select icon from https://pictogrammers.com/library/mdi/
     * - Do an Advanced PNG Export with 48x48 size and a white foreground
     */

    /**
     * @type {Electron.MenuItemConstructorOptions[]}
     */
    const menuTemplate = [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: "Firebot セットアップ",
                    toolTip: "Firebot セットアップでカスタム要素の作成・取り込み・削除を行います",
                    sublabel: "Firebot セットアップでカスタム要素の作成・取り込み・削除を行います",
                    icon: await createIconImage("../../../gui/images/icons/mdi/file-document-multiple-outline.png"),
                    submenu: [
                        {
                            label: 'Firebot セットアップを作成...',
                            toolTip: "コマンド・イベント・通貨などを含む Firebot セットアップを作成して共有します",
                            sublabel: "コマンド・イベント・通貨などを含む Firebot セットアップを作成して共有します",
                            click: () => {
                                frontendCommunicator.send("open-modal", {
                                    component: "createSetupModal"
                                });
                            },
                            icon: await createIconImage("../../../gui/images/icons/mdi/export.png")
                        },
                        {
                            label: 'Firebot セットアップを取り込み...',
                            toolTip: "他の人が作成した Firebot セットアップ（.firebotsetup）を取り込みます",
                            sublabel: "他の人が作成した Firebot セットアップ（.firebotsetup）を取り込みます",
                            click: () => {
                                frontendCommunicator.send("open-modal", {
                                    component: "importSetupModal"
                                });
                            },
                            icon: await createIconImage("../../../gui/images/icons/mdi/import.png")
                        },
                        {
                            label: 'Firebot セットアップを削除...',
                            toolTip: "セットアップファイルを選択し、保存済みの一致する要素（コマンド・イベント等）を削除します",
                            sublabel: "セットアップファイルを選択し、保存済みの一致する要素（コマンド・イベント等）を削除します",
                            click: () => {
                                frontendCommunicator.send("open-modal", {
                                    component: "removeSetupModal"
                                });
                            },
                            icon: await createIconImage("../../../gui/images/icons/mdi/file-remove-outline.png")
                        }
                    ]
                },
                {
                    type: 'separator'
                },
                {
                    label: 'データフォルダを開く',
                    toolTip: "Firebot のデータが保存されているフォルダを開きます",
                    sublabel: "Firebot のデータが保存されているフォルダを開きます",
                    click: () => {
                        const rootFolder = path.resolve(
                            ProfileManager.getPathInProfile("/")
                        );
                        shell.openPath(rootFolder);
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/folder-account-outline.png")
                },
                {
                    label: 'ログフォルダを開く',
                    toolTip: "ログが保存されているフォルダを開きます",
                    sublabel: "ログが保存されているフォルダを開きます",
                    click: () => {
                        const rootFolder = path.resolve(
                            dataAccess.getPathInUserData("/logs/")
                        );
                        shell.openPath(rootFolder);
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/folder-text-outline.png")
                },
                {
                    label: 'バックアップフォルダを開く',
                    toolTip: "バックアップが保存されているフォルダを開きます",
                    sublabel: "バックアップが保存されているフォルダを開きます",
                    click: () => {
                        const backupFolder = BackupManager.backupFolderPath;
                        shell.openPath(backupFolder);
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/folder-refresh-outline.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: 'アプリを終了',
                    role: 'quit',
                    icon: await createIconImage("../../../gui/images/icons/mdi/exit-run.png")
                }
            ]
        },
        {
            label: '編集',
            submenu: [
                {
                    label: '切り取り',
                    role: 'cut',
                    icon: await createIconImage("../../../gui/images/icons/mdi/content-cut.png")
                },
                {
                    label: 'コピー',
                    role: 'copy',
                    icon: await createIconImage("../../../gui/images/icons/mdi/content-copy.png")
                },
                {
                    label: '貼り付け',
                    role: 'paste',
                    icon: await createIconImage("../../../gui/images/icons/mdi/content-paste.png")
                },
                {
                    label: '元に戻す',
                    role: "undo",
                    icon: await createIconImage("../../../gui/images/icons/mdi/undo.png")
                },
                {
                    label: 'やり直し',
                    role: "redo",
                    icon: await createIconImage("../../../gui/images/icons/mdi/redo.png")
                },
                {
                    label: 'すべて選択',
                    role: "selectAll",
                    icon: await createIconImage("../../../gui/images/icons/mdi/select-all.png")
                }
            ]
        },
        {
            label: 'ウィンドウ',
            submenu: [
                {
                    label: '最小化',
                    role: 'minimize',
                    icon: await createIconImage("../../../gui/images/icons/mdi/window-minimize.png")
                },
                {
                    label: '閉じる',
                    role: 'close',
                    icon: await createIconImage("../../../gui/images/icons/mdi/window-close.png")
                }
            ]
        },
        {
            label: 'ツール',
            submenu: [
                {
                    label: 'セットアップウィザード',
                    toolTip: "セットアップウィザードを再実行します",
                    sublabel: "セットアップウィザードを再実行します",
                    click: () => {
                        frontendCommunicator.send("open-modal", {
                            component: "setupWizardModal"
                        });
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/auto-fix.png")
                },
                {
                    label: 'バックアップから復元...',
                    toolTip: "バックアップから Firebot を復元します",
                    sublabel: "バックアップから Firebot を復元します",
                    click: async () => {
                        frontendCommunicator.send("backups:start-restore-backup");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/backup-restore.png")
                },
                {
                    label: 'カスタム変数インスペクタ',
                    toolTip: "カスタム変数インスペクタを開きます",
                    sublabel: "カスタム変数インスペクタを開きます",
                    click: () => {
                        createVariableInspectorWindow();
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/text-search.png")
                },
                {
                    label: 'エフェクトキューモニター',
                    toolTip: "エフェクトキューモニターを開きます",
                    sublabel: "エフェクトキューモニターを開きます",
                    click: createEffectQueueMonitorWindow,
                    icon: await createIconImage("../../../gui/images/icons/mdi/queue-first-in-last-out.png")
                },
                {
                    label: 'オーバーレイをブラウザで開く',
                    toolTip: "Firebot のオーバーレイを既定のブラウザで開きます",
                    sublabel: "Firebot のオーバーレイを既定のブラウザで開きます",
                    submenu: [
                        {
                            label: "デフォルト",
                            toolTip: "Firebot のデフォルトオーバーレイを既定のブラウザで開きます",
                            sublabel: "Firebot のデフォルトオーバーレイを既定のブラウザで開きます",
                            click: () => {
                                const port = SettingsManager.getSetting("WebServerPort");
                                shell.openExternal(`http://localhost:${port}/overlay`);
                            }
                        },
                        ...overlayInstances.map(instance => ({
                            label: instance,
                            toolTip: `Firebot の ${instance} オーバーレイを既定のブラウザで開きます`,
                            sublabel: `Firebot の ${instance} オーバーレイを既定のブラウザで開きます`,
                            click: () => {
                                const port = SettingsManager.getSetting("WebServerPort");
                                shell.openExternal(`http://localhost:${port}/overlay?instance=${instance}`);
                            }
                        }))
                    ],
                    icon: await createIconImage("../../../gui/images/icons/mdi/open-in-app.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: '開発者ツールを開く',
                    role: 'toggledevtools',
                    icon: await createIconImage("../../../gui/images/icons/mdi/tools.png")
                }
            ]
        },
        {
            label: 'ヘルプ',
            role: 'help',
            submenu: [
                {
                    label: '開発Discordに参加',
                    click: () => {
                        shell.openExternal("https://discord.gg/crowbartools-372817064034959370");
                    },
                    icon: await createIconImage("../../../gui/images/icons/discord.png")
                },
                {
                    label: '@firebot.app をBlueskyでフォロー',
                    click: () => {
                        shell.openExternal("https://bsky.app/profile/firebot.app");
                    },
                    icon: await createIconImage("../../../gui/images/icons/bluesky.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: 'GitHubでソースを見る',
                    click: () => {
                        shell.openExternal("https://github.com/nmori/Firebot");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/source-branch.png")
                },
                {
                    label: '不具合を報告',
                    click: () => {
                        shell.openExternal("https://github.com/nmori/Firebot/issues/new?assignees=&template=bug_report.yml");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/bug-outline.png")
                },
                {
                    label: '機能をリクエスト',
                    click: () => {
                        shell.openExternal("https://github.com/nmori/Firebot/issues/new?assignees=&template=feature_request.md");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/star-circle-outline.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: 'マーチストア',
                    click: () => {
                        shell.openExternal("https://crowbar-tools.myspreadshop.com");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/shopping-outline.png")
                },
                {
                    label: '寄付する',
                    click: () => {
                        shell.openExternal("https://opencollective.com/crowbartools");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/hand-heart-outline.png")
                },
                {
                    label: '感想を投稿',
                    click: () => {
                        shell.openExternal("https://firebot.app/testimonial-submission");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/account-heart-outline.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: 'デバッグ情報をコピー...',
                    click: () => {
                        copyDebugInfoToClipboard();
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/bug-outline.png")
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Firebotについて...',
                    click: () => {
                        frontendCommunicator.send("open-about-modal");
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/information-outline.png")
                },
                {
                    label: 'リリースノート...',
                    click: () => {
                        frontendCommunicator.send("open-modal", {
                            component: "updateModal"
                        });
                    },
                    icon: await createIconImage("../../../gui/images/icons/mdi/list-box-outline.png")
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

/**
 * The splashscreen window.
 *@type {Electron.BrowserWindow}
 */
let splashscreenWindow;

async function createMainWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1280,
        defaultHeight: 720
    });

    const additionalArguments = [];

    if (Object.hasOwn(argv, 'fbuser-data-directory') && argv['fbuser-data-directory'] != null && argv['fbuser-data-directory'] !== '') {
        additionalArguments.push(`--fbuser-data-directory=${argv['fbuser-data-directory']}`);
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 300,
        minHeight: 50,
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png"),
        show: false,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#1E2023",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
            backgroundThrottling: false,
            contextIsolation: false,
            worldSafeExecuteJavaScript: false,
            enableRemoteModule: true,
            sandbox: false,
            preload: path.join(__dirname, './preload.js'),
            additionalArguments
        }
    });
    mainWindow.setBounds({
        height: mainWindowState.height || 720,
        width: mainWindowState.width || 1280
    }, false);

    mainWindow.webContents.setWindowOpenHandler(({ frameName, url }) => {
        if (frameName === 'modal') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    title: "Firebot",
                    frame: true,
                    titleBarStyle: "default",
                    parent: mainWindow,
                    width: 250,
                    height: 400,
                    javascript: false
                }
            };
        }

        shell.openExternal(url);
        return { action: "deny" };
    });

    //set a global reference, lots of backend files depend on this being available globally
    global.renderWindow = mainWindow;

    await createAppMenu();

    attachTitlebarToWindow(mainWindow);

    // register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

    // and load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "../../../gui/app/index.html"),
            protocol: "file:",
            slashes: true
        })
    );

    // wait for the main window's content to load, then show it
    mainWindow.webContents.on("did-finish-load", async () => {
        createTray(mainWindow);

        mainWindow.show();

        if (splashscreenWindow) {
            splashscreenWindow.destroy();
        }

        const startupScriptsManager = require("../../common/handlers/custom-scripts/startup-scripts-manager");
        await startupScriptsManager.runStartupScripts();

        const { EventManager } = require("../../events/event-manager");
        EventManager.triggerEvent("firebot", "firebot-started", {
            username: "Firebot"
        });

        if (SettingsManager.getSetting("OpenStreamPreviewOnLaunch") === true) {
            createStreamPreviewWindow();
        }

        if (SettingsManager.getSetting("OpenEffectQueueMonitorOnLaunch") === true) {
            createEffectQueueMonitorWindow();
        }

        fileOpenHelpers.setWindowReady(true);
    });


    mainWindow.on("close", (event) => {
        const connectionManager = require("../../common/connection-manager");
        if (!SettingsManager.getSetting("JustUpdated") && connectionManager.chatIsConnected() && connectionManager.streamerIsOnline()) {
            event.preventDefault();
            dialog.showMessageBox(mainWindow, {
                message: "Are you sure you want to close Firebot while connected to Twitch?",
                title: "Close Firebot",
                type: "question",
                buttons: ["Close Firebot", "Cancel"]

            }).then(({ response }) => {
                if (response === 0) {
                    mainWindow.destroy();
                    global.renderWindow = null;
                }
            }).catch(() => console.log("Error with close app confirmation"));
        } else {
            mainWindow.destroy();
            global.renderWindow = null;
        }
    });

    mainWindow.on("closed", () => {
        exports.events.emit("main-window-closed");

        if (variableInspectorWindow?.isDestroyed() === false) {
            logger.debug("Closing variable inspector window");
            variableInspectorWindow.destroy();
            global.variableInspectorWindow = null;
        }

        const effectQueueMonitorWindow = getEffectQueueMonitorWindow();
        if (effectQueueMonitorWindow?.isDestroyed() === false) {
            logger.debug("Effect queue monitor window");
            effectQueueMonitorWindow.destroy();
        }

        if (streamPreview?.isDestroyed() === false) {
            logger.debug("Closing stream preview window");
            streamPreview.destroy();
        }
    });
}

/**
 * Creates the splash screen
 */
const createSplashScreen = async () => {
    splashscreenWindow = new BrowserWindow({
        width: 375,
        height: 450,
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png"),
        transparent: true,
        backgroundColor: undefined,
        frame: false,
        closable: false,
        fullscreenable: false,
        movable: false,
        resizable: false,
        center: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../../../gui/splashscreen/preload.js")
        }
    });

    splashscreenWindow.once("ready-to-show", () => {
        logger.debug("...Showing splash screen");
        splashscreenWindow.show();
    });

    logger.debug("...Attempting to load splash screen url");
    return splashscreenWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "../../../gui/splashscreen/splash.html"),
            protocol: "file:",
            slashes: true
        }))
        .then(() => {
            logger.debug("Loaded splash screen");
        }).catch((reason) => {
            logger.error("Failed to load splash screen", reason);
        });
};

function updateSplashScreenStatus(newStatus) {
    if (splashscreenWindow == null || splashscreenWindow.isDestroyed()) {
        return;
    }

    splashscreenWindow.webContents.send("update-splash-screen-status", newStatus);
}

SettingsManager.on("settings:setting-updated:OverlayInstances", createAppMenu);

frontendCommunicator.on("getAllDisplays", () => {
    return screenHelpers.getAllDisplays();
});

frontendCommunicator.on("getPrimaryDisplay", () => {
    return screenHelpers.getPrimaryDisplay();
});

frontendCommunicator.on("takeScreenshot", (displayId) => {
    return screenHelpers.takeScreenshot(displayId);
});

exports.updateSplashScreenStatus = updateSplashScreenStatus;
exports.createVariableInspectorWindow = createVariableInspectorWindow;
exports.createStreamPreviewWindow = createStreamPreviewWindow;
exports.createMainWindow = createMainWindow;
exports.createSplashScreen = createSplashScreen;
exports.mainWindow = mainWindow;