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
const { settings } = require("../../common/settings-access");

setupTitlebar();

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
        if (!view.isDestroyed()) {
            view.destroy();
        }
    });
}

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
            label: '�t�@�C��',
            submenu: [{
                    label: 'Firebot �Z�b�g�A�b�v�̎�荞��...',
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
                    label: '�f�[�^�t�H���_���J��',
                    toolTip: "Firebot�̃f�[�^���ۑ�����Ă���t�H���_���J��",
                    click: () => {
                        const rootFolder = path.resolve(
                            profileManager.getPathInProfile("/")
                        );
                        shell.openPath(rootFolder);
                    }
                },
                {
                    label: '���O�t�H���_���J��',
                    toolTip: "���O���ۑ�����Ă���t�H���_���J��",
                    click: () => {
                        const rootFolder = path.resolve(
                            dataAccess.getPathInUserData("/logs/")
                        );
                        shell.openPath(rootFolder);
                    }
                },
                {
                    label: '�o�b�N�A�b�v�t�H���_���J��',
                    toolTip: "�o�b�N�A�b�v���ۑ�����Ă���t�H���_���J��",
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
                    label: '�A�v�����I��',
                    role: 'quit'
                }
            ]
        },
        {
            label: '�ҏW',
            submenu: [{
                    label: '�؂���',
                    role: 'cut'
                },
                {
                    label: '�R�s�[',
                    role: 'copy'
                },
                {
                    label: '�\��t��',
                    role: 'paste'
                },
                {
                    label: '��蒼��',
                    role: "undo"
                },
                {
                    label: '��蒼���̂�蒼��',
                    role: "redo"
                },
                {
                    label: '���ׂđI��',
                    role: "selectall"
                }
            ]
        },
        {
            label: '�E�B���h�E',
            submenu: [{
                    label: '�ŏ���',
                    role: 'minimize'
                },
                {
                    label: '����',
                    role: 'close'
                }
            ]
        },
        {
            label: '�c�[��',
            submenu: [{
                    label: '�Z�b�g�A�b�v�E�B�U�[�h',
                    toolTip: "���߂ď����Z�b�g�A�b�v���N�����܂�",
                    click: () => {
                        frontendCommunicator.send("open-modal", {
                            component: "setupWizardModal"
                        });
                    }
                },
                {
                    label: '�o�b�N�A�b�v����߂�...',
                    toolTip: "�o�b�N�A�b�v����Firebot�𕜌�",
                    click: async() => {
                        frontendCommunicator.send("restore-backup");
                    }
                },
                {
                    label: '�J�X�^���ϐ��ꗗ',
                    toolTip: "�J�X�^���ϐ��C���X�y�N�^���J��",
                    click: () => {
                        // eslint-disable-next-line no-use-before-define
                        createVariableInspectorWindow();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: '�J���c�[�����J��',
                    role: 'toggledevtools'
                }
            ]
        },
        {
            label: '�w���v(&H)',
            role: 'help',
            submenu: [{
                    label: '�J��Discord�ɎQ��',
                    click: () => {
                        shell.openExternal("https://discord.gg/tTmMbrG");
                    }
                },
                {
                    label: '@FirebotApp ��X�Ńt�H���[',
                    click: () => {
                        shell.openExternal("https://twitter.com/FirebotApp");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'GitHub�Ń\�[�X������',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot");
                    }
                },
                {
                    label: '�s��񍐂�����',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Bug&template=bug_report.yml&title=%5BBug%5D+");
                    }
                },
                {
                    label: '�@�\���N�G�X�g������',
                    click: () => {
                        shell.openExternal("https://github.com/crowbartools/Firebot/issues/new?assignees=&labels=Enhancement&template=feature_request.md&title=%5BFeature+Request%5D+");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: '�}�[�`�X�g�A',
                    click: () => {
                        shell.openExternal("https://crowbar-tools.myspreadshop.com");
                    }
                },
                {
                    label: '��t����',
                    click: () => {
                        shell.openExternal("https://opencollective.com/crowbartools");
                    }
                },
                {
                    label: '���q�l�̐�������',
                    click: () => {
                        shell.openExternal("https://firebot.app/testimonial-submission");
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Firebot�ɂ���...',
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

        if (settings.getOpenStreamPreviewOnLaunch() === true) {
            createStreamPreviewWindow();
        }

        fileOpenHelpers.setWindowReady(true);
    });


    mainWindow.on("close", (event) => {
        const connectionManager = require("../../common/connection-manager");
        if (!settings.hasJustUpdated() && connectionManager.chatIsConnected() && connectionManager.streamerIsOnline()) {
            event.preventDefault();
            dialog.showMessageBox(mainWindow, {
                message: "Twitch�ڑ����ł���Firebot���I�����Ă���낵���ł����H",
                title: "Firebot�����",
                type: "question",
                buttons: ["Firebot�����", "��߂�"]

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
    splashscreenWindow = new BrowserWindow({
        width: 375,
        height: 420,
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

exports.updateSplashScreenStatus = updateSplashScreenStatus;
exports.createVariableInspectorWindow = createVariableInspectorWindow;
exports.sendVariableCreateToInspector = sendVariableCreateToInspector;
exports.sendVariableExpireToInspector = sendVariableExpireToInspector;
exports.sendVariableDeleteToInspector = sendVariableDeleteToInspector;
exports.createStreamPreviewWindow = createStreamPreviewWindow;
exports.createMainWindow = createMainWindow;
exports.createSplashScreen = createSplashScreen;