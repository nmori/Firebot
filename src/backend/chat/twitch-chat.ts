import { EventEmitter } from "events";
import { ChatClient } from "@twurple/chat";

import { AccountAccess } from "../common/account-access";
import { ActiveUserHandler } from "./active-user-handler";
import { FirebotDeviceAuthProvider } from "../auth/firebot-device-auth-provider";
import { SharedChatCache } from "../streaming-platforms/twitch/chat/shared-chat-cache";
import { TwitchApi } from "../streaming-platforms/twitch/api";
import { TwitchEventSubChatHelpers } from "../streaming-platforms/twitch/api/eventsub/eventsub-chat-helpers";
import chatRolesManager from "../roles/chat-roles-manager";
import twitchRolesManager from "../roles/twitch-roles-manager";
import chatterPoll from "../streaming-platforms/twitch/chatter-poll";
import twitchChatListeners from "./chat-listeners/twitch-chat-listeners";
import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";

class TwitchChat extends EventEmitter {
    private _streamerChatClient: ChatClient;
    private _botChatClient: ChatClient;
    private _isConnecting = false;

    constructor() {
        super();

        this._streamerChatClient = null;
        this._botChatClient = null;
    }

    /**
     * Whether or not the streamer is currently connected
     */
    get chatIsConnected(): boolean {
        return (
            this._streamerChatClient?.irc?.isConnected === true
        );
    }

    /**
     * Disconnects the streamer and bot from chat
     */
    disconnect(emitDisconnectEvent = true): void {
        if (this._streamerChatClient != null) {
            try {
                this._streamerChatClient.quit();
            } catch (error) {
                logger.debug("Error quitting streamer chat client", error);
            }
            this._streamerChatClient = null;
        }
        // Note we quit the bot client regardless of whether it finished connecting.
        // Skipping the ones that are still connecting used to leave them alive with
        // their listeners attached, so they'd handle messages alongside the new client.
        if (this._botChatClient != null) {
            try {
                this._botChatClient.quit();
            } catch (error) {
                logger.debug("Error quitting bot chat client", error);
            }
            this._botChatClient = null;
        }
        if (emitDisconnectEvent) {
            this.emit("disconnected");
        }
        chatterPoll.stopChatterPoll();

        ActiveUserHandler.clearAllActiveUsers();
    }

    /**
     * Connects the streamer and bot to chat
     */
    async connect(): Promise<void> {
        const streamer = AccountAccess.getAccounts().streamer;
        if (!streamer.loggedIn) {
            return;
        }

        const streamerAuthProvider = FirebotDeviceAuthProvider.streamerProvider;
        if (streamerAuthProvider == null && FirebotDeviceAuthProvider.botProvider == null) {
            return;
        }

        if (this._isConnecting) {
            logger.warn("Chat connect is already in progress; ignoring duplicate connect request");
            return;
        }

        this.emit("connecting");
        this.disconnect(false);

        // Set only once the calls above can no longer throw, so a failure there can't
        // leave the flag stuck and lock out every later connect attempt. Everything
        // past this point runs inside the try blocks that clear it again.
        this._isConnecting = true;

        // Held locally so the awaits below can't leave us acting on a client that a
        // later connect() already replaced.
        let streamerChatClient: ChatClient;

        try {

            await this.connectBotClient();

            streamerChatClient = new ChatClient({
                authProvider: streamerAuthProvider,
                requestMembershipEvents: true
            });
            this._streamerChatClient = streamerChatClient;

            streamerChatClient.irc.onRegister(() => {
                void streamerChatClient.join(streamer.username);
                frontendCommunicator.send("twitch:chat:autodisconnected", false);
            });

            streamerChatClient.irc.onPasswordError((event) => {
                logger.error("Failed to connect to chat", event);
                frontendCommunicator.send(
                    "error",
                    `Unable to connect to chat. Reason: "${event.message}". Try signing out and back into your streamer/bot account(s).`
                );
                this.disconnect(true);
            });

            streamerChatClient.irc.onConnect(() => {
                this.emit("connected");
            });

            streamerChatClient.irc.onDisconnect((manual, reason) => {
                if (!manual) {
                    logger.error("Incoming Chat disconnected unexpectedly", reason);
                    frontendCommunicator.send("twitch:chat:autodisconnected", true);
                }
            });

            streamerChatClient.connect();

            /**
             * DO NOT AWAIT THIS
             * This is just to cache badges/emotes/cheermotes
             * Fire and forget this so we can get everything else setup
            */
            void TwitchEventSubChatHelpers.cacheChatAssets();

            // Attempt to reload the known bot list in case it failed on start
            await chatRolesManager.cacheViewerListBots();

            chatterPoll.startChatterPoll();

            // Refresh these once we connect to Twitch
            // While connected, we can just react to changes via chat messages/EventSub events
            await twitchRolesManager.loadVips();
            await twitchRolesManager.loadModerators();

            if (!twitchRolesManager.getSubscribers().length) {
                await twitchRolesManager.loadSubscribers();
            }

            // Load the current Shared Chat session
            await SharedChatCache.loadSessionFromTwitch();
        } catch (error) {
            logger.error("Chat connect error", error);
            this.disconnect();
        }

        try {
            if (this._streamerChatClient == null || this._streamerChatClient !== streamerChatClient) {
                logger.warn("Chat was disconnected or reconnected while connecting; skipping listener setup for the stale client");
            } else {
                twitchChatListeners.setupChatListeners(streamerChatClient, this._botChatClient);
            }
        } catch (error) {
            logger.error("Error setting up chat listeners", error);
        } finally {
            this._isConnecting = false;
        }
    }

    private connectBotClient(): Promise<void> {
        return new Promise((resolve) => {
            let hasResolved = false;
            let timeoutId: NodeJS.Timeout;
            const resolveIfNotResolved = () => {
                if (!hasResolved) {
                    hasResolved = true;
                    clearTimeout(timeoutId);
                    resolve();
                }
            };
            try {
                const { streamer, bot } = AccountAccess.getAccounts();

                if (bot.loggedIn) {

                    const botChatClient = new ChatClient({
                        authProvider: FirebotDeviceAuthProvider.botProvider,
                        requestMembershipEvents: true
                    });
                    this._botChatClient = botChatClient;

                    botChatClient.onConnect(() => {
                        resolveIfNotResolved();
                    });

                    botChatClient.irc.onRegister(() => botChatClient.join(streamer.username));

                    botChatClient.irc.onPasswordError((event) => {
                        logger.error("Failed to connect to chat with Bot account", event);
                        resolveIfNotResolved();
                    });

                    // Without this, a bot account that never finishes connecting would leave
                    // the awaiting connect() hung forever, which in turn leaves the connection
                    // manager stuck and pushes the user into reconnecting by hand.
                    timeoutId = setTimeout(() => {
                        logger.warn("Bot chat client did not connect in time; continuing without it");
                        resolveIfNotResolved();
                    }, 10000);

                    botChatClient.connect();

                } else {
                    this._botChatClient = null;
                    resolveIfNotResolved();
                }
            } catch (error) {
                logger.error("Error joining streamers chat channel with Bot account", error);
                resolveIfNotResolved();
            }
        });
    }

    /**
     * Sends the message as the bot if available, otherwise as the streamer.
     * If a username is provided, the message will be whispered.
     * If the message is too long, it will be automatically broken into multiple fragments and sent individually.
     *
     * @param message The message to send
     * @param username If provided, message will be whispered to the given user.
     * @param accountType Which account to chat as. Defaults to bot if available otherwise, the streamer.
     * @param replyToMessageId A message id to reply to
     * @deprecated Use the API wrapper methods ({@linkcode TwitchApi.chat.sendChatMessage()} and {@linkcode TwitchApi.whispers.sendWhisper()}) instead
     */
    async sendChatMessage(
        message: string,
        username?: string,
        accountType?: string,
        replyToMessageId?: string
    ): Promise<void> {
        if (message == null || message?.length < 1) {
            return null;
        }

        const shouldWhisper = username != null && username.trim() !== "";
        let sendAsBot = true;

        const botAvailable = AccountAccess.getAccounts().bot.loggedIn
            && this._botChatClient?.irc?.isConnected === true;

        if (accountType == null) {
            sendAsBot = botAvailable && !shouldWhisper ? true : false;
        } else {
            accountType = accountType.toLowerCase();
            if (accountType === "bot" && !botAvailable) {
                sendAsBot = false;
            }
        }

        if (shouldWhisper) {
            const user = await TwitchApi.users.getUserByName(username);
            await TwitchApi.whispers.sendWhisper(user.id, message, sendAsBot);
        } else {
            await TwitchApi.chat.sendChatMessage(message, replyToMessageId, sendAsBot);
        }
    }
}

const twitchChat = new TwitchChat();

export = twitchChat;