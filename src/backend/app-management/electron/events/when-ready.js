"use strict";

const {checkForFirebotSetupPathInArgs} = require("../../file-open-helpers");

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
    windowManagement.updateSplashScreenStatus("Twitch謗･邯壹ｒ隱ｭ霎ｼ荳ｭ...");
    require("../../../auth/auth-manager");
    const twitchAuth = require("../../../auth/twitch-auth");
    twitchAuth.registerTwitchAuthProviders();

    // load accounts
    windowManagement.updateSplashScreenStatus("繧｢繧ｫ繧ｦ繝ｳ繝郁ｨｭ螳壹ｒ隱ｭ霎ｼ荳ｭ...");
    const accountAccess = require("../../../common/account-access");
    await accountAccess.updateAccountCache(false);

    const firebotDeviceAuthProvider = require("../../../auth/firebot-device-auth-provider");
    firebotDeviceAuthProvider.setupDeviceAuthProvider();

    const connectionManager = require("../../../common/connection-manager");

    windowManagement.updateSplashScreenStatus("繧ｿ繧､繝槭・繧定ｪｭ霎ｼ荳ｭ...");
    const timerManager = require("../../../timers/timer-manager");
    await timerManager.loadItems();
    timerManager.startTimers();

    windowManagement.updateSplashScreenStatus("險育判縺輔ｌ縺滓ｼ泌・繧定ｪｭ霎ｼ荳ｭ...");
    const scheduledTaskManager = require("../../../timers/scheduled-task-manager");
    scheduledTaskManager.loadItems();
    scheduledTaskManager.start();

    windowManagement.updateSplashScreenStatus("Twitch縺ｨ繝・・繧ｿ蜷梧悄荳ｭ...");
    await accountAccess.refreshTwitchData();

    windowManagement.updateSplashScreenStatus("驟堺ｿ｡繧ｹ繝・・繧ｿ繧ｹ逶｣隕悶ｒ髢句ｧ・..");
    connectionManager.startOnlineCheckInterval();

    // load effects
    logger.debug("Loading effects...");
    windowManagement.updateSplashScreenStatus("貍泌・繧定ｪｭ霎ｼ荳ｭ...");
    const { loadEffects } = require("../../../effects/builtin-effect-loader");
    loadEffects();

    windowManagement.updateSplashScreenStatus("騾夊ｲｨ諠・ｱ繧定ｪｭ霎ｼ荳ｭ...");
    const currencyAccess = require("../../../currency/currency-access").default;
    currencyAccess.loadCurrencies();

    windowManagement.updateSplashScreenStatus("Loading ranks...");
    const viewerRanksManager = require("../../../ranks/rank-manager");
    viewerRanksManager.loadItems();

    // load commands
    logger.debug("Loading sys commands...");
    windowManagement.updateSplashScreenStatus("繧ｷ繧ｹ繝・Β繧ｳ繝槭Φ繝峨ｒ隱ｭ霎ｼ荳ｭ...");
    const { loadSystemCommands } = require("../../../chat/commands/system-command-loader");
    loadSystemCommands();

    // load event sources
    logger.debug("Loading event sources...");
    windowManagement.updateSplashScreenStatus("繧､繝吶Φ繝医ｒ隱ｭ霎ｼ荳ｭ...");
    const { loadEventSources } = require("../../../events/builtin-event-source-loader");
    loadEventSources();

    // load event filters
    logger.debug("Loading event filters...");
    windowManagement.updateSplashScreenStatus("繝輔ぅ繝ｫ繧ｿ繧定ｪｭ霎ｼ荳ｭ...");
    const { loadFilters } = require("../../../events/filters/builtin-filter-loader");
    loadFilters();

    // load integrations
    logger.debug("Loading integrations...");
    windowManagement.updateSplashScreenStatus("邨ｱ蜷域ｩ溯・繧定ｪｭ霎ｼ荳ｭ...");
    const { loadIntegrations } = require("../../../integrations/builtin-integration-loader");
    loadIntegrations();

    // load variables
    logger.debug("Loading variables...");
    windowManagement.updateSplashScreenStatus("螟画焚繧定ｪｭ霎ｼ荳ｭ...");
    const { loadReplaceVariables } = require("../../../variables/variable-loader");
    loadReplaceVariables();

    // load restrictions
    logger.debug("Loading restrictions...");
    windowManagement.updateSplashScreenStatus("蛻ｶ髯舌ョ繝ｼ繧ｿ繧定ｪｭ霎ｼ荳ｭ...");
    const { loadRestrictions } = require("../../../restrictions/builtin-restrictions-loader");
    loadRestrictions();

    const fontManager = require("../../../fontManager");
    fontManager.generateAppFontCssFile();

    windowManagement.updateSplashScreenStatus("繧､繝吶Φ繝医ｒ隱ｭ霎ｼ荳ｭ...");
    const eventsAccess = require("../../../events/events-access");
    eventsAccess.loadEventsAndGroups();

    windowManagement.updateSplashScreenStatus("繝√・繝縺ｮ蠖ｹ蜑ｲ繧定ｪｭ霎ｼ荳ｭ...");
    const teamRolesManager = require("../../../roles/team-roles-manager");
    teamRolesManager.loadTeamRoles();

    windowManagement.updateSplashScreenStatus("繧ｫ繧ｹ繧ｿ繝縺ｮ蠖ｹ蜑ｲ繧定ｪｭ霎ｼ荳ｭ...");
    const customRolesManager = require("../../../roles/custom-roles-manager");
    customRolesManager.loadCustomRoles();

    const chatRolesManager = require("../../../roles/chat-roles-manager");

    windowManagement.updateSplashScreenStatus("BOT繝ｪ繧ｹ繝医ｒ隱ｭ霎ｼ荳ｭ...");
    await chatRolesManager.cacheViewerListBots();

    windowManagement.updateSplashScreenStatus("繝｢繝・Ξ繝ｼ繧ｿ諠・ｱ隱ｭ霎ｼ荳ｭ...");
    await chatRolesManager.loadModerators();

    windowManagement.updateSplashScreenStatus("VIP諠・ｱ隱ｭ霎ｼ荳ｭ...");
    await chatRolesManager.loadVips();

    windowManagement.updateSplashScreenStatus("貍泌・繧ｭ繝･繝ｼ繧定ｪｭ霎ｼ荳ｭ...");
    const effectQueueManager = require("../../../effects/queues/effect-queue-config-manager");
    effectQueueManager.loadItems();

    windowManagement.updateSplashScreenStatus("繝励Μ繧ｻ繝・ヨ貍泌・繝ｪ繧ｹ繝医ｒ隱ｭ霎ｼ荳ｭ...");
    const presetEffectListManager = require("../../../effects/preset-lists/preset-effect-list-manager");
    presetEffectListManager.loadItems();

    windowManagement.updateSplashScreenStatus("繧ｯ繧､繝・け繧｢繧ｯ繧ｷ繝ｧ繝ｳ繧定ｪｭ霎ｼ荳ｭ...");
    const quickActionManager = require("../../../quick-actions/quick-action-manager");
    quickActionManager.loadItems();

    windowManagement.updateSplashScreenStatus("繧ｹ繧ｿ繝ｼ繝医い繝・・繧ｹ繧ｯ繝ｪ繝励ヨ螳溯｡御ｸｭ...");
    const startupScriptsManager = require("../../../common/handlers/custom-scripts/startup-scripts-manager");
    startupScriptsManager.loadStartupConfig();

    windowManagement.updateSplashScreenStatus("繝√Ε繝・ヨ繝｢繝・Ξ繝ｼ繝医ｒ襍ｷ蜍穂ｸｭ...");
    const { ChatModerationManager } = require("../../../chat/moderation/chat-moderation-manager");
    ChatModerationManager.load();

    windowManagement.updateSplashScreenStatus("繧ｫ繧ｦ繝ｳ繧ｿ繝ｼ繧定ｪｭ霎ｼ荳ｭ...");
    const { CounterManager } = require("../../../counters/counter-manager");
    CounterManager.loadItems();

    windowManagement.updateSplashScreenStatus("繧ｲ繝ｼ繝繧定ｪｭ霎ｼ荳ｭ...");
    const gamesManager = require("../../../games/game-manager");
    gamesManager.loadGameSettings();

    const builtinGameLoader = require("../../../games/builtin-game-loader");
    builtinGameLoader.loadGames();

    windowManagement.updateSplashScreenStatus("繧ｫ繧ｹ繧ｿ繝螟画焚繧定ｪｭ霎ｼ荳ｭ...");
    const { SettingsManager } = require("../../../common/settings-manager");
    if (SettingsManager.getSetting("PersistCustomVariables")) {
        const customVariableManager = require("../../../common/custom-variable-manager");
        customVariableManager.loadVariablesFromFile();
    }

    // get importer in memory
    windowManagement.updateSplashScreenStatus("繧､繝ｳ繝昴・繝医ｒ隱ｭ霎ｼ荳ｭ...");

    const setupImporter = require("../../../import/setups/setup-importer");
    setupImporter.setupListeners();

    const slcbImporter = require("../../../import/third-party/streamlabs-chatbot");
    slcbImporter.setupListeners();

    const { setupCommonListeners } = require("../../../common/common-listeners");
    setupCommonListeners();

    windowManagement.updateSplashScreenStatus("繝帙ャ繝医く繝ｼ繧定ｪｭ霎ｼ荳ｭ...");
    const { HotkeyManager } = require("../../../hotkeys/hotkey-manager");
    HotkeyManager.loadHotkeys();

    windowManagement.updateSplashScreenStatus("騾夊ｲｨ繧定ｪｭ霎ｼ荳ｭ...");
    const currencyManager = require("../../../currency/currencyManager");
    currencyManager.startTimer();

    // Connect to DBs.
    windowManagement.updateSplashScreenStatus("隕冶・閠・ョ繝ｼ繧ｿ繧定ｪｭ霎ｼ荳ｭ...");
    logger.info("Creating or connecting user database");
    const userdb = require("../../../database/userDatabase");
    userdb.connectUserDatabase();
    // Set users in user db to offline if for some reason they are still set to online. (app crash or something)
    userdb.setAllUsersOffline();

    windowManagement.updateSplashScreenStatus("繧ｹ繝・・繧ｿ繧ｹ繧定ｪｭ霎ｼ荳ｭ...");
    logger.info("Creating or connecting stats database");
    const statsdb = require("../../../database/statsDatabase");
    statsdb.connectStatsDatabase();

    windowManagement.updateSplashScreenStatus("蠑慕畑譁・ｒ隱ｭ霎ｼ荳ｭ...");
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

    windowManagement.updateSplashScreenStatus("繝舌ャ繧ｯ繧｢繝・・螳溯｡御ｸｭ...");
    const { BackupManager } = require("../../../backup-manager");
    await BackupManager.onceADayBackUpCheck();

    // start the REST api server
    windowManagement.updateSplashScreenStatus("Web繧ｵ繝ｼ繝占ｵｷ蜍穂ｸｭ...");
    const httpServerManager = require("../../../../server/http-server-manager");
    httpServerManager.start();

    // register websocket event handlers
    const websocketEventsHandler = require("../../../../server/websocket-events-handler");
    websocketEventsHandler.createComponentEventListeners();

    windowManagement.updateSplashScreenStatus("繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ繧定ｪｭ霎ｼ荳ｭ...");
    const channelRewardManager = require("../../../channel-rewards/channel-reward-manager");
    await channelRewardManager.loadChannelRewards();

    // load activity feed manager
    require("../../../events/activity-feed-manager");

    const iconManager = require("../../../common/icon-manager");
    iconManager.loadFontAwesomeIcons();

    windowManagement.updateSplashScreenStatus("驟堺ｿ｡諠・ｱ繧定ｪｭ霎ｼ荳ｭ...");
    const streamInfoPoll = require("../../../twitch-api/stream-info-manager");
    streamInfoPoll.startStreamInfoPoll();

    windowManagement.updateSplashScreenStatus("騾夂衍邂｡逅・ｒ襍ｷ蜍穂ｸｭ...");
    const notificationManager = require("../../../notifications/notification-manager").default;
    notificationManager.loadNotificationCache();

    // get ui extension manager in memory
    require("../../../ui-extensions/ui-extension-manager");

    logger.debug('...loading main window');
    windowManagement.updateSplashScreenStatus("貅門ｙ螳御ｺ・√＆縺∝ｧ九ａ繧医≧・・);
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
