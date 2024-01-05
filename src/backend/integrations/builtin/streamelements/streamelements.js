"use strict";
const logger = require("../../../logwrapper");
const EventEmitter = require("events");
const io = require("socket.io-client");

const seEventsHandler = require("./streamelements-event-handler");

const integrationDefinition = {
    id: "streamelements",
    name: "StreamElements",
    description: "寄付とフォローイベント",
    connectionToggle: true,
    linkType: "id",
    idDetails: {
        label: "JWT Token",
        steps:
`1.[StreamElements](https://www.streamelements.com/)へログインします.

2. あなたの [アカウント/チャンネル設定](https://streamelements.com/dashboard/account/channels)を開きます.

3. チャンネルタブで, **Show Secrets** をクリックします.

4. **JWT Token** をコピーし、ここに貼り付けてください ("JWT Token"の文字は不要です).`
    }
};

class StreamElementsIntegration extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
        this._socket = null;
        this.reconnectAttempts = 0;
    }
    init() {
        seEventsHandler.registerEvents();
    }
    async connect(integrationData) {
        const { accountId } = integrationData;

        if (accountId == null || accountId === "") {
            this.emit("disconnected", integrationDefinition.id);
            return;
        }

        this._socket = io('https://realtime.streamelements.com', {
            transports: ["websocket"]
        });

        this._socket.on('connect', () => {
            this._socket.emit('authenticate', {
                method: 'jwt',
                token: accountId
            });
            setTimeout(() => {
                if (!this.connected) {
                    this.reconnect();
                }
            }, 10000);
        });

        this._socket.on("error", (err) => {
            logger.error(err);

            this.disconnect();
            this.reconnect();
        });

        this._socket.on('disconnect', reason => {
            this.disconnect();

            if (reason !== "io client disconnect") {
                this.reconnect();
            }
        });

        this._socket.on('authenticated', (data) => {
            const {
                channelId
            } = data;

            logger.debug(`Successfully connected to StreamElements channel ${channelId}`);

            this.emit("connected", integrationDefinition.id);
            this.connected = true;
            this.reconnectAttempts = 0;
        });

        this._socket.on('event:test', (data) => {
            logger.debug("Received streamelements event:", data);
            if (data
                && data.listener === "tip-latest"
                && data.event
                && data.event.type === 'tip') {
                seEventsHandler.processDonationEvent(data.event);
            } else if (data && data.listener === "follower-latest") {
                seEventsHandler.processFollowEvent(data.event);
            }
        });

        this._socket.on('event', (event) => {
            logger.debug("Received streamelements event:", event);
            if (event && event.type === "tip") {
                seEventsHandler.processDonationEvent(event.data);
            } else if (event && event.type === "follow") {
                seEventsHandler.processFollowEvent(event.data);
            }
        });
    }

    reconnect() {
        if (this.reconnectAttempts === 3) {
            logger.warn("Attempted to reconnect to StreamElements 3 times, setting integration to disconnected...");
            this.disconnect();
            return;
        }

        this.emit("reconnect", integrationDefinition.id);
        this.reconnectAttempts++;
    }

    disconnect() {
        this._socket.close();
        this.connected = false;

        this.emit("disconnected", integrationDefinition.id);
    }

    link() {}

    async unlink() {
        if (this._socket) {
            this.disconnect();
        }
    }
}

const integration = new StreamElementsIntegration();

module.exports = {
    definition: integrationDefinition,
    integration: integration
};
