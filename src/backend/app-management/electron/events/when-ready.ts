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

    // --- 並列読み込みブロック（施策2）---
    // 以下のローダーは相互に依存しないため Promise.allSettled でまとめて実行する。
    // 個別に失敗してもログだけ出して他をブロックしない。起動クリティカルパス短縮が目的。
    windowManagement.updateSplashScreenStatus("各種データを読み込み中...");

    const parallelStartupTasks: { name: string, task: Promise<unknown> }[] = [
        {
            name: "timers",
            task: (async () => {
                const { TimerManager } = await import("../../../timers/timer-manager");
                TimerManager.loadItems();
                TimerManager.startTimers();
            })()
        },
        {
            name: "scheduled-tasks",
            task: (async () => {
                const { ScheduledTaskManager } = await import("../../../timers/scheduled-task-manager");
                ScheduledTaskManager.loadItems();
                ScheduledTaskManager.start();
            })()
        },
        {
            name: "currencies",
            task: (async () => {
                const currencyAccess = (await import("../../../currency/currency-access")).default;
                currencyAccess.loadCurrencies();
            })()
        },
        {
            name: "ranks",
            task: (async () => {
                const viewerRanksManager = (await import("../../../ranks/rank-manager")).default;
                viewerRanksManager.loadItems();
            })()
        },
        {
            name: "system-commands",
            task: (async () => {
                const { loadSystemCommands } = await import("../../../chat/commands/system-command-loader");
                loadSystemCommands();
            })()
        },
        {
            name: "event-sources",
            task: (async () => {
                const { loadEventSources } = await import("../../../events/builtin-event-source-loader");
                loadEventSources();
            })()
        },
        {
            name: "event-filters",
            task: (async () => {
                const { loadFilters } = await import("../../../events/filters/builtin-filter-loader");
                loadFilters();
            })()
        },
        {
            name: "integrations",
            task: (async () => {
                const { loadIntegrations } = await import("../../../integrations/builtin-integration-loader");
                loadIntegrations();
            })()
        },
        {
            name: "replace-variables",
            task: (async () => {
                const { loadReplaceVariables } = await import("../../../variables/variable-loader");
                loadReplaceVariables();
            })()
        },
        {
            name: "macros",
            task: (async () => {
                const macroManager = (await import("../../../variables/macro-manager")).default;
                macroManager.loadItems();
            })()
        },
        {
            name: "restrictions",
            task: (async () => {
                const { loadRestrictions } = await import("../../../restrictions/builtin-restrictions-loader");
                loadRestrictions();
            })()
        },
        {
            name: "fonts",
            task: (async () => {
                const { FontManager } = await import("../../../font-manager");
                await FontManager.loadInstalledFonts();
            })()
        },
        {
            name: "events",
            task: (async () => {
                const { EventsAccess } = await import("../../../events/events-access");
                EventsAccess.loadEventsAndGroups();
            })()
        },
        {
            name: "team-roles",
            task: (async () => {
                const teamRolesManager = (await import("../../../roles/team-roles-manager")).default;
                await teamRolesManager.loadTeamRoles();
            })()
        },
        {
            name: "custom-roles",
            task: (async () => {
                const customRolesManager = (await import("../../../roles/custom-roles-manager")).default;
                await customRolesManager.loadCustomRoles();
            })()
        },
        {
            name: "chat-roles",
            task: (async () => {
                const chatRolesManager = (await import("../../../roles/chat-roles-manager")).default;
                chatRolesManager.setupListeners();
                await chatRolesManager.cacheViewerListBots();
            })()
        },
        {
            name: "twitch-roles",
            task: (async () => {
                const twitchRolesManager = (await import("../../../roles/twitch-roles-manager")).default;
                twitchRolesManager.setupListeners();
                // Moderators / VIPs / Subscribers の3本は内部でも並列実行
                await Promise.allSettled([
                    twitchRolesManager.loadModerators(),
                    twitchRolesManager.loadVips(),
                    twitchRolesManager.loadSubscribers()
                ]);
            })()
        },
        {
            name: "effect-queues",
            task: (async () => {
                const { EffectQueueConfigManager } = await import("../../../effects/queues/effect-queue-config-manager");
                EffectQueueConfigManager.loadItems();
            })()
        },
        {
            name: "preset-effect-lists",
            task: (async () => {
                const { PresetEffectListManager } = await import("../../../effects/preset-lists/preset-effect-list-manager");
                PresetEffectListManager.loadItems();
            })()
        },
        {
            name: "quick-actions",
            task: (async () => {
                const { QuickActionManager } = await import("../../../quick-actions/quick-action-manager");
                QuickActionManager.loadItems();
            })()
        },
        {
            name: "webhooks",
            task: (async () => {
                const webhookConfigManager = (await import("../../../webhooks/webhook-config-manager")).default;
                webhookConfigManager.loadItems();
            })()
        },
        {
            name: "overlay-widgets",
            task: (async () => {
                const { loadWidgetTypes } = await import("../../../overlay-widgets/builtin-widget-type-loader");
                loadWidgetTypes();
                const overlayWidgetConfigManager = (await import("../../../overlay-widgets/overlay-widget-config-manager")).default;
                overlayWidgetConfigManager.loadItems();
            })()
        },
        {
            name: "startup-scripts",
            task: (async () => {
                const startupScriptsManager = await import("../../../common/handlers/custom-scripts/startup-scripts-manager");
                startupScriptsManager.loadStartupConfig();
            })()
        },
        {
            name: "chat-moderation",
            task: (async () => {
                const { ChatModerationManager } = await import("../../../chat/moderation/chat-moderation-manager");
                ChatModerationManager.load();
            })()
        },
        {
            name: "counters",
            task: (async () => {
                const { CounterManager } = await import("../../../counters/counter-manager");
                CounterManager.loadItems();
            })()
        },
        {
            name: "games",
            task: (async () => {
                const { GameManager } = await import("../../../games/game-manager");
                GameManager.loadGameSettings();
                const builtinGameLoader = await import("../../../games/builtin-game-loader");
                builtinGameLoader.loadGames();
            })()
        },
        {
            name: "custom-variables",
            task: (async () => {
                const { CustomVariableManager } = await import("../../../common/custom-variable-manager");
                CustomVariableManager.loadVariablesFromFile();
            })()
        },
        {
            name: "sort-tags",
            task: (async () => {
                const { SortTagManager } = await import("../../../sort-tags/sort-tag-manager");
                SortTagManager.loadSortTags();
            })()
        }
    ];

    const parallelResults = await Promise.allSettled(parallelStartupTasks.map(t => t.task));
    parallelResults.forEach((result, idx) => {
        if (result.status === "rejected") {
            logger.error(`Startup task "${parallelStartupTasks[idx].name}" failed during parallel load`, result.reason);
        }
    });
    // --- 並列読み込みブロックここまで ---

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