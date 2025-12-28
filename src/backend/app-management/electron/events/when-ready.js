"use strict";

const { checkForFirebotSetupPathInArgs } = require("../../file-open-helpers");
const frontendCommunicator = require("../../../common/frontend-communicator");

exports.whenReady = async () => {
    const logger = require("../../../logwrapper");

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
    await ensureRequiredFoldersExist();

    // load twitch auth
    windowManagement.updateSplashScreenStatus("Twitchログインシステムを読み込んでいます...");
    require("../../../auth/auth-manager");
    const twitchAuth = require("../../../streaming-platforms/twitch/auth/twitch-auth");
    twitchAuth.registerTwitchAuthProviders();

    // load accounts
    windowManagement.updateSplashScreenStatus("アカウントを読み込んでいます...");

    const { AccountAccess } = require("../../../common/account-access");
    AccountAccess.loadAccountData(false);

    const firebotDeviceAuthProvider = require("../../../auth/firebot-device-auth-provider");
    firebotDeviceAuthProvider.setupDeviceAuthProvider();

    const connectionManager = require("../../../common/connection-manager");

    windowManagement.updateSplashScreenStatus("タイマーを読み込んでいます...");
    const { TimerManager } = require("../../../timers/timer-manager");
    TimerManager.loadItems();
    TimerManager.startTimers();

    windowManagement.updateSplashScreenStatus("スケジュール済みエフェクトリストを読み込んでいます...");
    const { ScheduledTaskManager } = require("../../../timers/scheduled-task-manager");
    ScheduledTaskManager.loadItems();
    ScheduledTaskManager.start();

    windowManagement.updateSplashScreenStatus("Twitchアカウントデータを更新しています...");

    // Loading these first so that the refresh caches the account avatar URLs
    const _chatHelpers = require("../../../chat/chat-helpers");
    const _eventSubChatHelpers = require("../../../streaming-platforms/twitch/api/eventsub/eventsub-chat-helpers");

    const { TwitchApi } = require("../../../streaming-platforms/twitch/api");
    await TwitchApi.refreshAccounts();

    windowManagement.updateSplashScreenStatus("配信状態のポーリングを開始しています...");
    connectionManager.startOnlineCheckInterval();

    // load effects
    logger.debug("Loading effects...");
    windowManagement.updateSplashScreenStatus("エフェクトを読み込んでいます...");
    const { loadEffects } = require("../../../effects/builtin-effect-loader");
    loadEffects();

    windowManagement.updateSplashScreenStatus("通貨を読み込んでいます...");
    const currencyAccess = require("../../../currency/currency-access").default;
    currencyAccess.loadCurrencies();

    windowManagement.updateSplashScreenStatus("ランクを読み込んでいます...");
    const viewerRanksManager = require("../../../ranks/rank-manager");
    viewerRanksManager.loadItems();

    // load commands
    logger.debug("Loading sys commands...");
    windowManagement.updateSplashScreenStatus("システムコマンドを読み込んでいます...");
    const { loadSystemCommands } = require("../../../chat/commands/system-command-loader");
    loadSystemCommands();

    // load event sources
    logger.debug("Loading event sources...");
    windowManagement.updateSplashScreenStatus("イベントソースを読み込んでいます...");
    const { loadEventSources } = require("../../../events/builtin-event-source-loader");
    loadEventSources();

    // load event filters
    logger.debug("Loading event filters...");
    windowManagement.updateSplashScreenStatus("フィルターを読み込んでいます...");
    const { loadFilters } = require("../../../events/filters/builtin-filter-loader");
    loadFilters();

    // load integrations
    logger.debug("Loading integrations...");
    windowManagement.updateSplashScreenStatus("統合機能を読み込んでいます...");
    const { loadIntegrations } = require("../../../integrations/builtin-integration-loader");
    loadIntegrations();

    // load variables
    logger.debug("Loading variables...");
    windowManagement.updateSplashScreenStatus("変数を読み込んでいます...");
    const { loadReplaceVariables } = require("../../../variables/variable-loader");
    loadReplaceVariables();

    windowManagement.updateSplashScreenStatus("変数マクロを読み込んでいます...");
    const macroManager = require("../../../variables/macro-manager");
    macroManager.loadItems();

    // load restrictions
    logger.debug("Loading restrictions...");
    windowManagement.updateSplashScreenStatus("制限を読み込んでいます...");
    const { loadRestrictions } = require("../../../restrictions/builtin-restrictions-loader");
    loadRestrictions();

    windowManagement.updateSplashScreenStatus("フォントを読み込んでいます...");
    const { FontManager } = require("../../../font-manager");
    await FontManager.loadInstalledFonts();

    windowManagement.updateSplashScreenStatus("イベントを読み込んでいます...");
    const { EventsAccess } = require("../../../events/events-access");
    EventsAccess.loadEventsAndGroups();

    windowManagement.updateSplashScreenStatus("チームロールを読み込んでいます...");
    const teamRolesManager = require("../../../roles/team-roles-manager");
    teamRolesManager.loadTeamRoles();

    windowManagement.updateSplashScreenStatus("カスタムロールを読み込んでいます...");
    const customRolesManager = require("../../../roles/custom-roles-manager");
    await customRolesManager.loadCustomRoles();

    const chatRolesManager = require("../../../roles/chat-roles-manager");
    chatRolesManager.setupListeners();

    windowManagement.updateSplashScreenStatus("既知のボットリストを読み込んでいます...");
    await chatRolesManager.cacheViewerListBots();

    windowManagement.updateSplashScreenStatus("チャンネルモデレーターを読み込んでいます...");
    await chatRolesManager.loadModerators();

    windowManagement.updateSplashScreenStatus("チャンネルVIPを読み込んでいます...");
    await chatRolesManager.loadVips();

    windowManagement.updateSplashScreenStatus("エフェクトキューを読み込んでいます...");
    const { EffectQueueConfigManager } = require("../../../effects/queues/effect-queue-config-manager");
    EffectQueueConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("プリセットエフェクトリストを読み込んでいます...");
    const { PresetEffectListManager } = require("../../../effects/preset-lists/preset-effect-list-manager");
    PresetEffectListManager.loadItems();

    windowManagement.updateSplashScreenStatus("クイックアクションを読み込んでいます...");
    const { QuickActionManager } = require("../../../quick-actions/quick-action-manager");
    QuickActionManager.loadItems();

    windowManagement.updateSplashScreenStatus("Webhookを読み込んでいます...");
    const webhookConfigManager = require("../../../webhooks/webhook-config-manager");
    webhookConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("オーバーレイウィジェットを読み込んでいます...");
    const { loadWidgetTypes } = require("../../../overlay-widgets/builtin-widget-type-loader");
    loadWidgetTypes();

    const overlayWidgetConfigManager = require("../../../overlay-widgets/overlay-widget-config-manager");
    overlayWidgetConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("起動スクリプトデータを読み込んでいます...");
    const startupScriptsManager = require("../../../common/handlers/custom-scripts/startup-scripts-manager");
    startupScriptsManager.loadStartupConfig();

    windowManagement.updateSplashScreenStatus("チャットモデレーションマネージャーを起動しています...");
    const { ChatModerationManager } = require("../../../chat/moderation/chat-moderation-manager");
    ChatModerationManager.load();

    windowManagement.updateSplashScreenStatus("カウンターを読み込んでいます...");
    const { CounterManager } = require("../../../counters/counter-manager");
    CounterManager.loadItems();

    windowManagement.updateSplashScreenStatus("ゲームを読み込んでいます...");
    const gamesManager = require("../../../games/game-manager");
    gamesManager.loadGameSettings();

    const builtinGameLoader = require("../../../games/builtin-game-loader");
    builtinGameLoader.loadGames();

    windowManagement.updateSplashScreenStatus("カスタム変数を読み込んでいます...");
    const { SettingsManager } = require("../../../common/settings-manager");
    if (SettingsManager.getSetting("PersistCustomVariables")) {
        const customVariableManager = require("../../../common/custom-variable-manager");
        customVariableManager.loadVariablesFromFile();
    }

    windowManagement.updateSplashScreenStatus("ソートタグを読み込んでいます...");
    const { SortTagManager } = require("../../../sort-tags/sort-tag-manager");
    SortTagManager.loadSortTags();

    // get importer in memory
    windowManagement.updateSplashScreenStatus("インポーターを読み込んでいます...");

    const { SetupManager } = require("../../../setups/setup-manager");
    SetupManager.setupListeners();

    const { ImportManager } = require("../../../import/import-manager");
    ImportManager.registerDefaultImporters();

    const { setupCommonListeners } = require("../../../common/common-listeners");
    setupCommonListeners();

    windowManagement.updateSplashScreenStatus("ホットキーを読み込んでいます...");
    const { HotkeyManager } = require("../../../hotkeys/hotkey-manager");
    HotkeyManager.loadHotkeys();

    windowManagement.updateSplashScreenStatus("通貨タイマーを開始しています...");
    const currencyManager = require("../../../currency/currency-manager");
    currencyManager.startTimer();

    // Connect to DBs.
    windowManagement.updateSplashScreenStatus("視聴者を読み込んでいます...");
    logger.info("Creating or connecting user database");
    const viewerDatabase = require("../../../viewers/viewer-database");
    await viewerDatabase.connectViewerDatabase();

    // Set users in user db to offline if for some reason they are still set to online. (app crash or something)
    const viewerOnlineStatusManager = require("../../../viewers/viewer-online-status-manager");
    await viewerOnlineStatusManager.setAllViewersOffline();

    windowManagement.updateSplashScreenStatus("引用を読み込んでいます...");
    logger.info("Creating or connecting quotes database");
    const { QuoteManager } = require("../../../quotes/quote-manager");
    await QuoteManager.loadQuoteDatabase();

    // These are defined globally for Custom Scripts.
    // We will probably want to handle these differently but we shouldn't
    // change anything until we are ready as changing this will break most scripts
    const Effect = require("../../../common/EffectType");
    global.EffectType = Effect.EffectTypeV5Map;
    const { ProfileManager } = require("../../../common/profile-manager");
    global.SCRIPTS_DIR = ProfileManager.getPathInProfile("/scripts/");

    windowManagement.updateSplashScreenStatus("日次バックアップを実行しています...");
    const { BackupManager } = require("../../../backup-manager");
    await BackupManager.onceADayBackUpCheck();

    // start the REST api server
    windowManagement.updateSplashScreenStatus("内部Webサーバーを起動しています...");
    const httpServerManager = require("../../../../server/http-server-manager");
    httpServerManager.start();

    // register websocket event handlers
    const websocketEventsHandler = require("../../../../server/websocket-events-handler");
    websocketEventsHandler.createComponentEventListeners();

    windowManagement.updateSplashScreenStatus("チャンネル報酬を読み込んでいます...");
    const channelRewardManager = require("../../../channel-rewards/channel-reward-manager");
    await channelRewardManager.loadChannelRewards();

    // load activity feed manager
    require("../../../events/activity-feed-manager");

    const { IconManager } = require("../../../common/icon-manager");
    await IconManager.loadFontAwesomeIcons();

    windowManagement.updateSplashScreenStatus("配信情報のポーリングを開始しています...");
    const streamInfoPoll = require("../../../streaming-platforms/twitch/stream-info-manager");
    streamInfoPoll.startStreamInfoPoll();

    windowManagement.updateSplashScreenStatus("通知マネージャーを起動しています...");
    const { NotificationManager } = require("../../../notifications/notification-manager");
    NotificationManager.loadNotificationCache();

    // get ui extension manager in memory
    require("../../../ui-extensions/ui-extension-manager");

    // start crowbar relay websocket
    require("../../../crowbar-relay/crowbar-relay-websocket");

    const countdownManager = require("../../../overlay-widgets/builtin-types/countdown/countdown-manager");
    countdownManager.startTimer();

    logger.debug('...loading main window');
    windowManagement.updateSplashScreenStatus("準備完了、さぁ始めよう！");
    await windowManagement.createMainWindow();

    // Receive log messages from frontend
    frontendCommunicator.on("logging", (data) => {
        logger.log(data.level, data.message, data.meta);
    });
};
