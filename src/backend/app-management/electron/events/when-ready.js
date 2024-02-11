"use strict";

const {checkForFirebotSetupPath} = require("../../file-open-helpers");

exports.whenReady = async () => {
    const logger = require("../../../logwrapper");

    logger.debug('...Loading updater backend');
    const setupUpdater = require('../../../updater/updater');
    setupUpdater();

    logger.debug('...Applyig IPC events');
    const setupIpcEvents = require('./ipc-events');
    setupIpcEvents();

    logger.debug("...Checking for setup file");

    checkForFirebotSetupPath(process.argv);

    logger.debug("...Loading window management");
    const windowManagement = require("../window-management");

    logger.debug("Showing splash screen...");
    await windowManagement.createSplashScreen();

    logger.debug("...Ensuring required folders exist");
    // Ensure required folders are created
    const { ensureRequiredFoldersExist } = require("../../data-tasks");
    ensureRequiredFoldersExist();

    // load twitch auth
    windowManagement.updateSplashScreenStatus("Twitch接続を読込中...");
    require("../../../auth/auth-manager");
    const twitchAuth = require("../../../auth/twitch-auth");
    twitchAuth.registerTwitchAuthProviders();

    // load accounts
    windowManagement.updateSplashScreenStatus("アカウント設定を読込中...");
    const accountAccess = require("../../../common/account-access");
    await accountAccess.updateAccountCache(false);

    const firebotDeviceAuthProvider = require("../../../auth/firebot-device-auth-provider");
    firebotDeviceAuthProvider.setupDeviceAuthProvider();

    const connectionManager = require("../../../common/connection-manager");

    windowManagement.updateSplashScreenStatus("タイマーを読込中...");
    const timerManager = require("../../../timers/timer-manager");
    await timerManager.loadItems();
    timerManager.startTimers();

    windowManagement.updateSplashScreenStatus("計画された演出を読込中...");
    const scheduledTaskManager = require("../../../timers/scheduled-task-manager");
    scheduledTaskManager.loadItems();
    scheduledTaskManager.start();

    windowManagement.updateSplashScreenStatus("Twitchとデータ同期中...");
    await accountAccess.refreshTwitchData();

    const twitchFrontendListeners = require("../../../twitch-api/frontend-twitch-listeners");
    twitchFrontendListeners.setupListeners();

    windowManagement.updateSplashScreenStatus("配信ステータス監視を開始...");
    connectionManager.startOnlineCheckInterval();

    // load effects
    logger.debug("Loading effects...");
    windowManagement.updateSplashScreenStatus("演出を読込中...");
    const { loadEffects } = require("../../../effects/builtin-effect-loader");
    loadEffects();

    windowManagement.updateSplashScreenStatus("Loading currencies...");
    const currencyAccess = require("../../../currency/currency-access").default;
    currencyAccess.refreshCurrencyCache();

    // load commands
    logger.debug("Loading sys commands...");
    windowManagement.updateSplashScreenStatus("システムコマンドを読込中...");
    const { loadSystemCommands } = require("../../../chat/commands/system-command-loader");
    loadSystemCommands();

    // load event sources
    logger.debug("Loading event sources...");
    windowManagement.updateSplashScreenStatus("イベントを読込中...");
    const { loadEventSources } = require("../../../events/builtin-event-source-loader");
    loadEventSources();

    // load event filters
    logger.debug("Loading event filters...");
    windowManagement.updateSplashScreenStatus("フィルタを読込中...");
    const { loadFilters } = require("../../../events/filters/builtin-filter-loader");
    loadFilters();

    // load integrations
    logger.debug("Loading integrations...");
    windowManagement.updateSplashScreenStatus("統合機能を読込中...");
    const { loadIntegrations } = require("../../../integrations/builtin-integration-loader");
    loadIntegrations();

    // load variables
    logger.debug("Loading variables...");
    windowManagement.updateSplashScreenStatus("変数を読込中...");
    const { loadReplaceVariables } = require("../../../variables/variable-loader");
    loadReplaceVariables();

    // load restrictions
    logger.debug("Loading restrictions...");
    windowManagement.updateSplashScreenStatus("制限データを読込中...");
    const { loadRestrictions } = require("../../../restrictions/builtin-restrictions-loader");
    loadRestrictions();

    const fontManager = require("../../../fontManager");
    fontManager.generateAppFontCssFile();

    windowManagement.updateSplashScreenStatus("イベントを読込中...");
    const eventsAccess = require("../../../events/events-access");
    eventsAccess.loadEventsAndGroups();

    windowManagement.updateSplashScreenStatus("チームの役割を読込中...");
    const teamRolesManager = require("../../../roles/team-roles-manager");
    teamRolesManager.loadTeamRoles();

    windowManagement.updateSplashScreenStatus("カスタムの役割を読込中...");
    const customRolesManager = require("../../../roles/custom-roles-manager");
    customRolesManager.loadCustomRoles();

    windowManagement.updateSplashScreenStatus("BOTリストを読込中...");
    const chatRolesManager = require("../../../roles/chat-roles-manager");
    await chatRolesManager.cacheViewerListBots();

    windowManagement.updateSplashScreenStatus("演出キューを読込中...");
    const effectQueueManager = require("../../../effects/queues/effect-queue-manager");
    effectQueueManager.loadItems();

    windowManagement.updateSplashScreenStatus("プリセット演出リストを読込中...");
    const presetEffectListManager = require("../../../effects/preset-lists/preset-effect-list-manager");
    presetEffectListManager.loadItems();

    windowManagement.updateSplashScreenStatus("クイックアクションを読込中...");
    const quickActionManager = require("../../../quick-actions/quick-action-manager");
    quickActionManager.loadItems();

    windowManagement.updateSplashScreenStatus("スタートアップスクリプト実行中...");
    const startupScriptsManager = require("../../../common/handlers/custom-scripts/startup-scripts-manager");
    startupScriptsManager.loadStartupConfig();

    windowManagement.updateSplashScreenStatus("チャットモデレートを起動中...");
    const chatModerationManager = require("../../../chat/moderation/chat-moderation-manager");
    chatModerationManager.load();

    windowManagement.updateSplashScreenStatus("カウンターを読込中...");
    const countersManager = require("../../../counters/counter-manager");
    countersManager.loadItems();

    windowManagement.updateSplashScreenStatus("ゲームを読込中...");
    const gamesManager = require("../../../games/game-manager");
    gamesManager.loadGameSettings();

    const builtinGameLoader = require("../../../games/builtin-game-loader");
    builtinGameLoader.loadGames();

    windowManagement.updateSplashScreenStatus("カスタム変数を読込中...");
    const {settings} = require("../../../common/settings-access");
    if (settings.getPersistCustomVariables()) {
        const customVariableManager = require("../../../common/custom-variable-manager");
        customVariableManager.loadVariablesFromFile();
    }

    // get importer in memory
    windowManagement.updateSplashScreenStatus("インポートを読込中...");
    const v4Importer = require("../../../import/v4/v4-importer");
    v4Importer.setupListeners();

    const setupImporter = require("../../../import/setups/setup-importer");
    setupImporter.setupListeners();

    const slcbImporter = require("../../../import/third-party/streamlabs-chatbot");
    slcbImporter.setupListeners();

    const { setupCommonListeners } = require("../../../common/common-listeners");
    setupCommonListeners();

    windowManagement.updateSplashScreenStatus("ホットキーを読込中...");
    const hotkeyManager = require("../../../hotkeys/hotkey-manager");
    hotkeyManager.refreshHotkeyCache();

    windowManagement.updateSplashScreenStatus("通貨を読込中...");
    const currencyManager = require("../../../currency/currencyManager");
    currencyManager.startTimer();

    // Connect to DBs.
    windowManagement.updateSplashScreenStatus("視聴者データを読込中...");
    logger.info("Creating or connecting user database");
    const viewerDatabase = require("../../../viewers/viewer-database");
    await viewerDatabase.connectViewerDatabase();

    // Set users in user db to offline if for some reason they are still set to online. (app crash or something)
    const viewerOnlineStatusManager = require("../../../viewers/viewer-online-status-manager");
    await viewerOnlineStatusManager.setAllViewersOffline();

    windowManagement.updateSplashScreenStatus("ステータスを読込中...");
    logger.info("Creating or connecting stats database");
    const statsdb = require("../../../database/statsDatabase");
    statsdb.connectStatsDatabase();

    windowManagement.updateSplashScreenStatus("引用文を読込中...");
    logger.info("Creating or connecting quotes database");
    const quotesdb = require("../../../quotes/quotes-manager");
    quotesdb.loadQuoteDatabase();

    // These are defined globally for Custom Scripts.
    // We will probably wnat to handle these differently but we shouldn't
    // change anything until we are ready as changing this will break most scripts
    const Effect = require("../../../common/EffectType");
    global.EffectType = Effect.EffectTypeV5Map;
    const profileManager = require("../../../common/profile-manager");
    global.SCRIPTS_DIR = profileManager.getPathInProfile("/scripts/");

    windowManagement.updateSplashScreenStatus("バックアップ実行中...");
    const backupManager = require("../../../backup-manager");
    await backupManager.onceADayBackUpCheck();

    // start the REST api server
    windowManagement.updateSplashScreenStatus("Webサーバ起動中...");
    const httpServerManager = require("../../../../server/http-server-manager");
    httpServerManager.start();

    windowManagement.updateSplashScreenStatus("チャンネル報酬を読込中...");
    const channelRewardManager = require("../../../channel-rewards/channel-reward-manager");
    await channelRewardManager.loadChannelRewards();

    // load activity feed manager
    require("../../../events/activity-feed-manager");

    const iconManager = require("../../../common/icon-manager");
    iconManager.loadFontAwesomeIcons();

    windowManagement.updateSplashScreenStatus("配信情報を読込中...");
    const streamInfoPoll = require("../../../twitch-api/stream-info-manager");
    streamInfoPoll.startStreamInfoPoll();

    windowManagement.updateSplashScreenStatus("Starting notification manager...");
    const notificationManager = require("../../../notifications/notification-manager").default;
    await notificationManager.loadAllNotifications();
    notificationManager.startExternalNotificationCheck();

    logger.debug('...loading main window');
    windowManagement.updateSplashScreenStatus("準備完了、さぁ始めよう！");
    await windowManagement.createMainWindow();

    // forward backend logs to front end
    logger.on("logging", (transport, level, msg, meta) => {
        const mainWindow = windowManagement.mainWindow;
        if (mainWindow != null && !mainWindow.isDestroyed() && mainWindow.webContents != null) {
            mainWindow.webContents.send("logging", {
                transport: transport ? { name: transport.name } : null,
                level: level,
                msg: msg,
                meta: meta
            });
        }
    });
};