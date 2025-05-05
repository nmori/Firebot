"use strict";

const {checkForFirebotSetupPathInArgs} = require("../../file-open-helpers");

exports.whenReady = async () => {
    const logger = require("../../../logwrapper");

    logger.debug('...Loading updater backend');
    const setupUpdater = require('../../../updater/updater');
    setupUpdater();

    logger.debug('...Applying IPC events');
    const setupIpcEvents = require('./ipc-events');
    setupIpcEvents();

    logger.debug("...Checking for setup file");

    checkForFirebotSetupPathInArgs(process.argv);

    logger.debug("...Loading window management");
    const windowManagement = require("../window-management");

    logger.debug("Showing splash screen...");
    await windowManagement.createSplashScreen();

    logger.debug("...Ensuring required folders exist");
    // Ensure required folders are created
    const { ensureRequiredFoldersExist } = require("../../data-tasks");
    ensureRequiredFoldersExist();

    // 並列でロード可能なモジュールの事前読み込み
    windowManagement.updateSplashScreenStatus("モジュールを準備中...");
    const twitchAuth = require("../../../auth/twitch-auth");
    const accountAccess = require("../../../common/account-access");
    const firebotDeviceAuthProvider = require("../../../auth/firebot-device-auth-provider");
    const connectionManager = require("../../../common/connection-manager");
    const timerManager = require("../../../timers/timer-manager");
    const scheduledTaskManager = require("../../../timers/scheduled-task-manager");
    
    // load twitch auth
    windowManagement.updateSplashScreenStatus("Twitch接続とアカウント設定を読込中...");
    
    // 認証関連の処理を並列実行
    await Promise.all([
        (async () => {
            require("../../../auth/auth-manager");
            twitchAuth.registerTwitchAuthProviders();
            await accountAccess.updateAccountCache(false);
            firebotDeviceAuthProvider.setupDeviceAuthProvider();
        })(),
        
        // タイマー関連の並列ロード
        (async () => {
            await timerManager.loadItems();
            timerManager.startTimers();
            scheduledTaskManager.loadItems();
            scheduledTaskManager.start();
        })()
    ]);

    windowManagement.updateSplashScreenStatus("Twitchとデータ同期中...");
    await accountAccess.refreshTwitchData();
    
    windowManagement.updateSplashScreenStatus("配信ステータス監視を開始...");
    connectionManager.startOnlineCheckInterval();

    // モジュールを事前にrequireして準備
    logger.debug("準備モジュールを読込中...");
    windowManagement.updateSplashScreenStatus("モジュールを読込中...");
    
    const { loadEffects } = require("../../../effects/builtin-effect-loader");
    const currencyAccess = require("../../../currency/currency-access").default;
    const viewerRanksManager = require("../../../ranks/rank-manager");
    const { loadSystemCommands } = require("../../../chat/commands/system-command-loader");
    const { loadEventSources } = require("../../../events/builtin-event-source-loader");
    const { loadFilters } = require("../../../events/filters/builtin-filter-loader");
    const { loadIntegrations } = require("../../../integrations/builtin-integration-loader");
    const { loadReplaceVariables } = require("../../../variables/variable-loader");
    const macroManager = require("../../../variables/macro-manager");
    const { loadRestrictions } = require("../../../restrictions/builtin-restrictions-loader");
    const { FontManager } = require("../../../font-manager");
    const eventsAccess = require("../../../events/events-access");
    const teamRolesManager = require("../../../roles/team-roles-manager");
    const customRolesManager = require("../../../roles/custom-roles-manager");
    const chatRolesManager = require("../../../roles/chat-roles-manager");
    const effectQueueManager = require("../../../effects/queues/effect-queue-config-manager");
    const presetEffectListManager = require("../../../effects/preset-lists/preset-effect-list-manager");
    const quickActionManager = require("../../../quick-actions/quick-action-manager");
    const startupScriptsManager = require("../../../common/handlers/custom-scripts/startup-scripts-manager");
    const { ChatModerationManager } = require("../../../chat/moderation/chat-moderation-manager");
    const { CounterManager } = require("../../../counters/counter-manager");
    const gamesManager = require("../../../games/game-manager");
    const builtinGameLoader = require("../../../games/builtin-game-loader");
    const { SettingsManager } = require("../../../common/settings-manager");
    const { SortTagManager } = require("../../../sort-tags/sort-tag-manager");
    const setupImporter = require("../../../import/setups/setup-importer");
    const slcbImporter = require("../../../import/third-party/streamlabs-chatbot");
    const { setupCommonListeners } = require("../../../common/common-listeners");
    const { HotkeyManager } = require("../../../hotkeys/hotkey-manager");
    const currencyManager = require("../../../currency/currencyManager");
    
    // 優先度の高いモジュールを最初に並列ロード
    windowManagement.updateSplashScreenStatus("主要機能を読込中...");
    
    await Promise.all([
        // 1. コア機能
        (async () => {
            loadEffects();
            loadSystemCommands();
            loadEventSources();
            loadFilters();
        })(),
        
        // 2. データ関連
        (async () => {
            currencyAccess.loadCurrencies();
            viewerRanksManager.loadItems();
            loadIntegrations();
        })(),
        
        // 3. 変数とUI関連
        (async () => {
            loadReplaceVariables();
            macroManager.loadItems();
            loadRestrictions();
            FontManager.loadInstalledFonts();
        })(),
        
        // 4. 役割関連
        (async () => {
            eventsAccess.loadEventsAndGroups();
            teamRolesManager.loadTeamRoles();
            await customRolesManager.loadCustomRoles();
        })()
    ]);
    
    // 第2段階のロード (ユーザー関連)
    windowManagement.updateSplashScreenStatus("ユーザー情報を読込中...");
    await Promise.all([
        chatRolesManager.cacheViewerListBots(),
        chatRolesManager.loadModerators(),
        chatRolesManager.loadVips()
    ]);
    
    // 第3段階のロード (設定関連)
    windowManagement.updateSplashScreenStatus("設定とゲームを読込中...");
    await Promise.all([
        (async () => {
            effectQueueManager.loadItems();
            presetEffectListManager.loadItems();
            quickActionManager.loadItems();
        })(),
        
        (async () => {
            startupScriptsManager.loadStartupConfig();
            ChatModerationManager.load();
            CounterManager.loadItems();
        })(),
        
        (async () => {
            gamesManager.loadGameSettings();
            builtinGameLoader.loadGames();
            if (SettingsManager.getSetting("PersistCustomVariables")) {
                const customVariableManager = require("../../../common/custom-variable-manager");
                customVariableManager.loadVariablesFromFile();
            }
            SortTagManager.loadSortTags();
        })()
    ]);
    
    // 第4段階のロード (インポートとリスナー)
    windowManagement.updateSplashScreenStatus("リスナーとホットキーを読込中...");
    await Promise.all([
        (async () => {
            setupImporter.setupListeners();
            slcbImporter.setupListeners();
            setupCommonListeners();
        })(),
        
        (async () => {
            HotkeyManager.loadHotkeys();
            currencyManager.startTimer();
        })()
    ]);

    // データベース接続を並列に行う
    windowManagement.updateSplashScreenStatus("データベースに接続中...");
    logger.info("Connecting to databases in parallel");
    
    // DBモジュールの読み込み
    const viewerDatabase = require("../../../viewers/viewer-database");
    const viewerOnlineStatusManager = require("../../../viewers/viewer-online-status-manager");
    const statsdb = require("../../../database/statsDatabase");
    const quotesdb = require("../../../quotes/quotes-manager");
    
    // データベース接続を並列実行
    await Promise.all([
        (async () => {
            await viewerDatabase.connectViewerDatabase();
            await viewerOnlineStatusManager.setAllViewersOffline();
        })(),
        statsdb.connectStatsDatabase(),
        quotesdb.loadQuoteDatabase()
    ]);
    
    // グローバル設定
    const Effect = require("../../../common/EffectType");
    global.EffectType = Effect.EffectTypeV5Map;
    const profileManager = require("../../../common/profile-manager");
    global.SCRIPTS_DIR = profileManager.getPathInProfile("/scripts/");

    // ウェブサーバーとUI関連の起動
    windowManagement.updateSplashScreenStatus("Webサーバ起動中...");
    const httpServerManager = require("../../../../server/http-server-manager");
    const websocketEventsHandler = require("../../../../server/websocket-events-handler");
    const channelRewardManager = require("../../../channel-rewards/channel-reward-manager");
    const { IconManager } = require("../../../common/icon-manager");
    const streamInfoPoll = require("../../../twitch-api/stream-info-manager");
    const notificationManager = require("../../../notifications/notification-manager").default;
    
    // ウェブサーバーを起動しながら他の処理も並列実行
    await Promise.all([
        (async () => {
            httpServerManager.start();
            websocketEventsHandler.createComponentEventListeners();
        })(),
        
        (async () => {
            await channelRewardManager.loadChannelRewards();
            require("../../../events/activity-feed-manager");
            require("../../../ui-extensions/ui-extension-manager");
        })(),
        
        (async () => {
            await IconManager.loadFontAwesomeIcons();
            streamInfoPoll.startStreamInfoPoll();
            notificationManager.loadNotificationCache();
        })()
    ]);
    
    // バックアップ確認処理を遅延実行するためのタイマーをセット
    const { BackupManager } = require("../../../backup-manager");
    setTimeout(() => {
        BackupManager.onceADayBackUpCheck().catch(err => {
            logger.error("Failed to run backup check", err);
        });
    }, 60000); // 1分後に実行
    
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
