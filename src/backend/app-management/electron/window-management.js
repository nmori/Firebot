"use strict";

const electron = require("electron");
const { ipcMain, BrowserWindow, BrowserView, Menu, shell, dialog } = electron;
const path = require("path");
const url = require("url");
const windowStateKeeper = require("electron-window-state");
const fileOpenHelpers = require("../file-open-helpers");
const createTray = require('./tray-creation.js');
const logger = require("../../logwrapper");
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");
const screenHelpers = require("./screen-helpers");
const frontendCommunicator = require("../../common/frontend-communicator");

setupTitlebar();

/**
 * Firebot's main window
 * Keeps a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 *@type {Electron.BrowserWindow}
 */
exports.mainWindow = null;

/**
 * The splashscreen window.
 *@type {Electron.BrowserWindow}
 */
let splashscreenWindow;


function createMainWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1280,
        defaultHeight: 720
    });

    ipcMain.on('preload.openDevTools', (event) => {
        if (exports.mainWindow != null) {
            exports.mainWindow.webContents.openDevTools();
            event.returnValue = true;
        }
        event.returnValue = false;
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
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
            preload: path.join(__dirname, './preload.js')
        }
    });

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
    exports.mainWindow = mainWindow;
    global.renderWindow = mainWindow;

    const profileManager = require("../../common/profile-manager");
    const dataAccess = require("../../common/data-access");
    const menuTemplate = [{
            label: 'ファイル',
            submenu: [{
                    label: 'Firebot セットアップの取り込み...',
                    click: () => {
                        frontendCommunicator.send("open-modal", {
                            component: "importSetupModal"
                        });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'データフォルダを開く',
                    toolTip: "Firebotのデータが保存されているフォルダを開く",
                    click: () => {
                        const rootFolder = path.resolve(
                            profileManager.getPathInProfile("/")
                        );
                        shell.openPath(rootFolder);
                    }
                },
                {
                    label: 'ログフォルダを開く',
                    toolTip: "ログが保存されているフォルダを開く",
                    click: () => {
                        const rootFolder = path.resolve(
                            dataAccess.getPathInUserData("/logs/")
                        );
                        shell.openPath(rootFolder);
                    }
                },
                {
                    label: 'バックアップフォルダを開く',
                    toolTip: "バックアップが保存されているフォルダを開く",
                    click: () => {
                        const backupFolder = path.resolve(
                            dataAccess.getPathInUserData("/backups/")
                        );
                        shell.openPath(backupFolder);
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'アプリを終了',
                    role: 'quit'
                }
            ]
        },
        {
            label: '編集',
            submenu: [{
                    label: '切り取り',
                    role: 'cut'
                },
                {
                    label: 'コピー',
                    role: 'copy'
                },
                {
                    label: '貼り付け',
                    role: 'paste'
                },
                {
                    label: 'やり直し',
                    role: "undo"
                },
                {
                    label: 'やり直しのやり直し',
                    role: "redo"
                },
                {
                    label: 'すべて選択',
                    role: "selectall"
                }
            ]
        },
        {
            label: 'ウィンドウ',
            submenu: [{
                    label: '最小化',
                    role: 'minimize'
                },
                {
                    label: '閉じる',
                    role: 'close'
                }
            ]
        },
        {
            label: 'ツール',
            submenu: [{
                    label: 'セットアップウィザード',
                    toolTip: "改めて初期セットアップを起動します",
                    click: () => {
                        frontendCommunicator.send("open-modal", {
                            component: "setupWizardModal"
                        });
                    }
                },
                {
                    label: 'バックアップから戻す...',
                    toolTip: "バックアップからFirebotを復元",
                    click: async() => {
                        frontendCommunicator.send("restore-backup");
                    }
                },
                {
                    label: 'カスタム変数一覧',
                    toolTip: "カスタム変数インスペクタを開く",
                    click: () => {
                        // eslint-disable-next-line no-use-before-define
                        createVariableInspectorWindow();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: '開発ツールを開く',
                    role: 'toggledevtools'
                }
            ]
        },
        {
            label: 'ヘルプ',
            role: 'help',
            submenu: [{
                    label: '開発Discordに参加',
                    click: () => {
                        shell.openExternal("https://discord.gg/tTmMbrG");
                    }
                },
                {
                    label: '@FirebotApp をXでフォロー',
                    click: () => {
                        shell.openExternal("https://twitter.com/FirebotApp");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'GitHubでソースを見る',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot");
                    }
                },
                {
                    label: '不具合報告をする',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Bug&template=bug_report.yml&title=%5BBug%5D+");
                    }
                },
                {
                    label: '機能リクエストをする',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Enhancement&template=feature_request.md&title=%5BFeature+Request%5D+");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'マーチストア',
                    click: () => {
                        shell.openExternal("https://crowbar-tools.myspreadshop.com");
                    }
                },
                {
                    label: '寄付する',
                    click: () => {
                        shell.openExternal("https://opencollective.com/crowbartools");
                    }
                },
                {
                    label: 'お客様の声を書く',
                    click: () => {
                        shell.openExternal("https://firebot.app/testimonial-submission");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Firebotについて...',
                    click: () => {
                        frontendCommunicator.send("open-about-modal");
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

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
    mainWindow.webContents.on("did-finish-load", () => {

        createTray(mainWindow);

        // mainWindow.webContents.openDevTools();
        mainWindow.show();

        // mainWindow.show();
        if (splashscreenWindow) {
            splashscreenWindow.destroy();
        }

        const startupScriptsManager = require("../../common/handlers/custom-scripts/startup-scripts-manager");
        startupScriptsManager.runStartupScripts();

        const eventManager = require("../../events/EventManager");
        eventManager.triggerEvent("firebot", "firebot-started", {
            username: "Firebot"
        });

        fileOpenHelpers.setWindowReady(true);
    });


    mainWindow.on("close", (event) => {
        const connectionManager = require("../../common/connection-manager");
        const { settings } = require("../../common/settings-access");
        if (!settings.hasJustUpdated() && connectionManager.chatIsConnected() && connectionManager.streamerIsOnline()) {
            event.preventDefault();
            dialog.showMessageBox(mainWindow, {
                message: "Twitch接続中ですがFirebotを終了してもよろしいですか？",
                title: "Firebotを閉じる",
                type: "question",
                buttons: ["Firebotを閉じる", "やめる"]

            }).then(({ response }) => {
                if (response === 0) {
                    mainWindow.destroy();
                }
            }).catch(() => console.log("Error with close app confirmation"));
        }
    });
}

/**
 * Creates the splash screen
 */
const createSplashScreen = async() => {
    const isLinux = process.platform !== 'win32' && process.platform !== 'darwin';
    const splash = new BrowserWindow({
        width: 240,
        height: 325,
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png"),
        transparent: !isLinux,
        backgroundColor: isLinux ? "#34363C" : undefined,
        frame: false,
        closable: false,
        fullscreenable: false,
        movable: false,
        resizable: false,
        center: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    splashscreenWindow = splash;

    splash.on("ready-to-show", () => {
        logger.debug("...Showing splash screen");
        splash.show();
    });

    logger.debug("...Attempting to load splash screen url");
    return splash.loadURL(
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

/**
 * Firebot's main window
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

    const accountAccess = require("../../common/account-access");
    const streamer = accountAccess.getAccounts().streamer;

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
        parent: exports.mainWindow,
        width: streamPreviewWindowState.width,
        height: streamPreviewWindowState.height,
        x: streamPreviewWindowState.x,
        y: streamPreviewWindowState.y,
        javascript: false,
        webPreferences: {},
        icon: path.join(__dirname, "../../../gui/images/logo_transparent_2.png")
    });
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
        if (!view.isDestroyed) {
            view.destroy();
        }
    });
}

/**
 * The variable inspector window.
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
        parent: exports.mainWindow,
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

    await variableInspectorWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "../../../gui/variable-inspector/index.html"),
            protocol: "file:",
            slashes: true
        }));

    const customVariableManager = require("../../common/custom-variable-manager");
    variableInspectorWindow.webContents.send("all-variables", customVariableManager.getInitialInspectorVariables());
}

function sendVariableCreateToInspector(key, value, ttl) {
    if (variableInspectorWindow == null || variableInspectorWindow.isDestroyed()) {
        return;
    }

    variableInspectorWindow.webContents.send("variable-set", {
        key,
        value,
        ttl
    });
}

function sendVariableExpireToInspector(key, value) {
    if (variableInspectorWindow == null || variableInspectorWindow.isDestroyed()) {
        return;
    }

    variableInspectorWindow.webContents.send("variable-expire", {
        key,
        value
    });
}

function sendVariableDeleteToInspector(key) {
    if (variableInspectorWindow == null || variableInspectorWindow.isDestroyed()) {
        return;
    }

    variableInspectorWindow.webContents.send("variable-deleted", {
        key
    });
}

frontendCommunicator.on("getAllDisplays", () => {
    return screenHelpers.getAllDisplays();
});

frontendCommunicator.on("getPrimaryDisplay", () => {
    return screenHelpers.getPrimaryDisplay();
});

frontendCommunicator.on("takeScreenshot", (displayId) => {
    return screenHelpers.takeScreenshot(displayId);
});

exports.createVariableInspectorWindow = createVariableInspectorWindow;
exports.sendVariableCreateToInspector = sendVariableCreateToInspector;
exports.sendVariableExpireToInspector = sendVariableExpireToInspector;
exports.sendVariableDeleteToInspector = sendVariableDeleteToInspector;
exports.createStreamPreviewWindow = createStreamPreviewWindow;
exports.createMainWindow = createMainWindow;
exports.createSplashScreen = createSplashScreen;