import { checkForFirebotSetupPathInArgs } from "../../file-open-helpers";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";

export async function whenReady() {

    logger.debug("...Applying IPC events");
    const { setupIpcEvents } = await import("./ipc-events");
    setupIpcEvents();

    logger.debug("...Checking for setup file");

    checkForFirebotSetupPathInArgs(process.argv);

    logger.debug("...Loading window management");
    const windowManagement = await import("../window-management");

    logger.debug("Showing splash screen...");
    await windowManagement.createSplashScreen();

    logger.debug("...Ensuring required folders exist");
    // Ensure required folders are created
    const { ensureRequiredFoldersExist } = await import("../../data-tasks");
    await ensureRequiredFoldersExist();

    // load twitch auth
    windowManagement.updateSplashScreenStatus("Twitchログインシステムを読み込み中...");
    await import("../../../auth/auth-manager");
    const { TwitchAuthProviders } = await import("../../../streaming-platforms/twitch/auth/twitch-auth");
    TwitchAuthProviders.registerTwitchAuthProviders();

    // load accounts
    windowManagement.updateSplashScreenStatus("アカウントを読み込み中...");

    const { AccountAccess } = await import("../../../common/account-access");
    AccountAccess.loadAccountData(false);

    const { FirebotDeviceAuthProvider } = await import("../../../auth/firebot-device-auth-provider");
    FirebotDeviceAuthProvider.setupDeviceAuthProvider();

    const connectionManager = (await import("../../../common/connection-manager")).default;

    windowManagement.updateSplashScreenStatus("タイマーを読み込み中...");
    const { TimerManager } = await import("../../../timers/timer-manager");
    TimerManager.loadItems();
    TimerManager.startTimers();

    windowManagement.updateSplashScreenStatus("スケジュール演出リストを読み込み中...");
    const { ScheduledTaskManager } = await import("../../../timers/scheduled-task-manager");
    ScheduledTaskManager.loadItems();
    ScheduledTaskManager.start();

    windowManagement.updateSplashScreenStatus("Twitchアカウント情報を更新中...");

    // Loading these first so that the refresh caches the account avatar URLs
    const _chatHelpers = await import("../../../chat/chat-helpers");
    const _eventSubChatHelpers = await import("../../../streaming-platforms/twitch/api/eventsub/eventsub-chat-helpers");

    const { TwitchApi } = await import("../../../streaming-platforms/twitch/api");
    await TwitchApi.refreshAccounts();

    windowManagement.updateSplashScreenStatus("配信状態ポーリングを開始中...");
    connectionManager.startOnlineCheckInterval();

    // load effects
    logger.debug("Loading effects...");
    windowManagement.updateSplashScreenStatus("エフェクトを読み込み中...");
    const { loadEffects } = await import("../../../effects/builtin-effect-loader");
    loadEffects();

    windowManagement.updateSplashScreenStatus("通貨を読み込み中...");
    const currencyAccess = (await import("../../../currency/currency-access")).default;
    currencyAccess.loadCurrencies();

    windowManagement.updateSplashScreenStatus("ランクを読み込み中...");
    const viewerRanksManager = (await import("../../../ranks/rank-manager")).default;
    viewerRanksManager.loadItems();

    // load commands
    logger.debug("Loading sys commands...");
    windowManagement.updateSplashScreenStatus("システムコマンドを読み込み中...");
    const { loadSystemCommands } = await import("../../../chat/commands/system-command-loader");
    loadSystemCommands();

    // load event sources
    logger.debug("Loading event sources...");
    windowManagement.updateSplashScreenStatus("イベントソースを読み込み中...");
    const { loadEventSources } = await import("../../../events/builtin-event-source-loader");
    loadEventSources();

    // load event filters
    logger.debug("Loading event filters...");
    windowManagement.updateSplashScreenStatus("フィルターを読み込み中...");
    const { loadFilters } = await import("../../../events/filters/builtin-filter-loader");
    loadFilters();

    // load integrations
    logger.debug("Loading integrations...");
    windowManagement.updateSplashScreenStatus("連携を読み込み中...");
    const { loadIntegrations } = await import("../../../integrations/builtin-integration-loader");
    loadIntegrations();

    // load variables
    logger.debug("Loading variables...");
    windowManagement.updateSplashScreenStatus("変数を読み込み中...");
    const { loadReplaceVariables } = await import("../../../variables/variable-loader");
    loadReplaceVariables();

    windowManagement.updateSplashScreenStatus("変数マクロを読み込み中...");
    const macroManager = (await import("../../../variables/macro-manager")).default;
    macroManager.loadItems();

    // load restrictions
    logger.debug("Loading restrictions...");
    windowManagement.updateSplashScreenStatus("制限を読み込み中...");
    const { loadRestrictions } = await import("../../../restrictions/builtin-restrictions-loader");
    loadRestrictions();

    windowManagement.updateSplashScreenStatus("フォントを読み込み中...");
    const { FontManager } = await import("../../../font-manager");
    await FontManager.loadInstalledFonts();

    windowManagement.updateSplashScreenStatus("イベントを読み込み中...");
    const { EventsAccess } = await import("../../../events/events-access");
    EventsAccess.loadEventsAndGroups();

    windowManagement.updateSplashScreenStatus("チームロールを読み込み中...");
    const teamRolesManager = (await import("../../../roles/team-roles-manager")).default;
    await teamRolesManager.loadTeamRoles();

    windowManagement.updateSplashScreenStatus("カスタムロールを読み込み中...");
    const customRolesManager = (await import("../../../roles/custom-roles-manager")).default;
    await customRolesManager.loadCustomRoles();

    const chatRolesManager = (await import("../../../roles/chat-roles-manager")).default;
    chatRolesManager.setupListeners();

    windowManagement.updateSplashScreenStatus("既知ボット一覧を読み込み中...");
    await chatRolesManager.cacheViewerListBots();

    const twitchRolesManager = (await import("../../../roles/twitch-roles-manager")).default;
    twitchRolesManager.setupListeners();

    windowManagement.updateSplashScreenStatus("チャンネルモデレーターを読み込み中...");
    await twitchRolesManager.loadModerators();

    windowManagement.updateSplashScreenStatus("チャンネルVIPを読み込み中...");
    await twitchRolesManager.loadVips();

    windowManagement.updateSplashScreenStatus("チャンネル登録者を読み込み中...");
    await twitchRolesManager.loadSubscribers();

    windowManagement.updateSplashScreenStatus("エフェクトキューを読み込み中...");
    const { EffectQueueConfigManager } = await import("../../../effects/queues/effect-queue-config-manager");
    EffectQueueConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("プリセット演出リストを読み込み中...");
    const { PresetEffectListManager } = await import("../../../effects/preset-lists/preset-effect-list-manager");
    PresetEffectListManager.loadItems();

    windowManagement.updateSplashScreenStatus("クイックアクションを読み込み中...");
    const { QuickActionManager } = await import("../../../quick-actions/quick-action-manager");
    QuickActionManager.loadItems();

    windowManagement.updateSplashScreenStatus("Webhookを読み込み中...");
    const webhookConfigManager = (await import("../../../webhooks/webhook-config-manager")).default;
    webhookConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("オーバーレイウィジェットを読み込み中...");
    const { loadWidgetTypes } = await import("../../../overlay-widgets/builtin-widget-type-loader");
    loadWidgetTypes();

    const overlayWidgetConfigManager = (await import("../../../overlay-widgets/overlay-widget-config-manager")).default;
    overlayWidgetConfigManager.loadItems();

    windowManagement.updateSplashScreenStatus("起動スクリプトデータを読み込み中...");
    const startupScriptsManager = await import("../../../common/handlers/custom-scripts/startup-scripts-manager");
    startupScriptsManager.loadStartupConfig();

    windowManagement.updateSplashScreenStatus("チャットモデレーションマネージャーを開始中...");
    const { ChatModerationManager } = await import("../../../chat/moderation/chat-moderation-manager");
    ChatModerationManager.load();

    windowManagement.updateSplashScreenStatus("カウンターを読み込み中...");
    const { CounterManager } = await import("../../../counters/counter-manager");
    CounterManager.loadItems();

    windowManagement.updateSplashScreenStatus("ゲームを読み込み中...");
    const { GameManager } = await import("../../../games/game-manager");
    GameManager.loadGameSettings();

    const builtinGameLoader = await import("../../../games/builtin-game-loader");
    builtinGameLoader.loadGames();

    windowManagement.updateSplashScreenStatus("カスタム変数を読み込み中...");
    const { CustomVariableManager } = await import("../../../common/custom-variable-manager");
    CustomVariableManager.loadVariablesFromFile();

    windowManagement.updateSplashScreenStatus("ソートタグを読み込み中...");
    const { SortTagManager } = await import("../../../sort-tags/sort-tag-manager");
    SortTagManager.loadSortTags();

    // get importer in memory
    windowManagement.updateSplashScreenStatus("インポーターを読み込み中...");

    const { SetupManager } = await import("../../../setups/setup-manager");
    SetupManager.setupListeners();

    const { ImportManager } = await import("../../../import/import-manager");
    ImportManager.registerDefaultImporters();

    const { ViewerExportManager } = await import("../../../viewers/viewer-export-manager");
    ViewerExportManager.setupListeners();

    const { setupCommonListeners } = await import("../../../common/common-listeners");
    setupCommonListeners();

    windowManagement.updateSplashScreenStatus("ホットキーを読み込み中...");
    const { HotkeyManager } = await import("../../../hotkeys/hotkey-manager");
    HotkeyManager.loadItems();

    windowManagement.updateSplashScreenStatus("通貨タイマーを開始中...");
    const currencyManager = (await import("../../../currency/currency-manager")).default;
    currencyManager.startTimer();

    // Connect to DBs.
    windowManagement.updateSplashScreenStatus("視聴者を読み込み中...");
    logger.info("Creating or connecting user database");
    const viewerDatabase = (await import("../../../viewers/viewer-database")).default;
    await viewerDatabase.connectViewerDatabase();

    // Set users in user db to offline if for some reason they are still set to online. (app crash or something)
    const viewerOnlineStatusManager = (await import("../../../viewers/viewer-online-status-manager")).default;
    await viewerOnlineStatusManager.setAllViewersOffline();

    windowManagement.updateSplashScreenStatus("引用を読み込み中...");
    logger.info("Creating or connecting quotes database");
    const { QuoteManager } = await import("../../../quotes/quote-manager");
    await QuoteManager.loadQuoteDatabase();

    // These are defined globally for Custom Scripts.
    // We will probably want to handle these differently but we shouldn't
    // change anything until we are ready as changing this will break most scripts
    const Effect = await import("../../../common/EffectType");
    global.EffectType = Effect.EffectTypeV5Map;
    const { ProfileManager } = await import("../../../common/profile-manager");
    global.SCRIPTS_DIR = ProfileManager.getPathInProfile("/scripts/");

    windowManagement.updateSplashScreenStatus("日次バックアップを実行中...");
    const { BackupManager } = await import("../../../backup-manager");
    await BackupManager.onceADayBackUpCheck();

    // start the REST api server
    windowManagement.updateSplashScreenStatus("内部Webサーバーを起動中...");
    const httpServerManager = (await import("../../../../server/http-server-manager")).default;
    httpServerManager.start();

    // register websocket event handlers
    const websocketEventsHandler = await import("../../../../server/websocket-events-handler");
    websocketEventsHandler.createComponentEventListeners();

    windowManagement.updateSplashScreenStatus("チャンネル特典を読み込み中...");
    const channelRewardManager = (await import("../../../channel-rewards/channel-reward-manager")).default;
    await channelRewardManager.loadChannelRewards();

    // load activity feed manager
    await import("../../../events/activity-feed-manager");

    const { IconManager } = await import("../../../common/icon-manager");
    await IconManager.loadFontAwesomeIcons();

    windowManagement.updateSplashScreenStatus("配信情報ポーリングを開始中...");
    const streamInfoPoll = (await import("../../../streaming-platforms/twitch/stream-info-manager")).default;
    streamInfoPoll.startStreamInfoPoll();

    windowManagement.updateSplashScreenStatus("通知マネージャーを開始中...");
    const { NotificationManager } = await import("../../../notifications/notification-manager");
    NotificationManager.loadNotificationCache();

    // get ui extension manager in memory
    await import("../../../ui-extensions/ui-extension-manager");

    // crowbar relay websocket is disabled in this fork (no third-party token relay)

    const countdownManager = (await import("../../../overlay-widgets/builtin-types/countdown/countdown-manager")).default;
    countdownManager.startTimer();

    logger.debug("...loading main window");
    windowManagement.updateSplashScreenStatus("まもなく起動します...");
    await windowManagement.createMainWindow();

    // Receive log messages from frontend
    frontendCommunicator.on("logging", (data: {
        level: string;
        message: string;
        meta?: unknown[];
    }) => {
        logger.log(data.level, data.message, ...(data.meta ?? []));
    });
};