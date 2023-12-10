"use strict";
const EventEmitter = require("events");
const { extraLifePollService } = require("./extralife-poll");

const integrationDefinition = {
    id: "extralife",
    name: "ExtraLife",
    description: "ExtraLife 寄付イベント",
    connectionToggle: true,
    linkType: "id",
    idDetails: {
        steps:
`1. ナビリンクの**Your Page** からExtraLifeページに移動します。

2. URLバーにある「参加者ID」を探してください \`participantID=\`.

3. 参加者IDを以下に貼り付けてください。`
    }
};

class ExtraLifeIntegration extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
    }
    init() {
        const eventManager = require("../../../events/EventManager");
        eventManager.registerEventSource({
            id: "extralife",
            name: "ExtraLife",
            description: "ExtraLife 寄付イベント",
            events: [
                {
                    id: "donation",
                    name: "ドネートされたとき",
                    description: "誰かがあなたのExtraLife キャンペーンに寄付した場合",
                    cached: false,
                    manualMetadata: {
                        from: "ExtraLife",
                        formattedDonationAmount: 5,
                        donationMessage: "テストメッセージ"
                    },
                    isIntegration: true,
                    queued: true,
                    activityFeed: {
                        icon: "fad fa-money-bill",
                        getMessage: (eventData) => {
                            return `**${eventData.from}** donated **${eventData.formattedDonationAmount}** to ExtraLife${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                        }
                    }
                }
            ]
        });

        extraLifePollService.on("connected", () => {
            this.connected = true;
            this.emit("connected", integrationDefinition.id);
        });

        extraLifePollService.on("disconnected", () => {
            if (!this.connected) {
                return;
            }
            this.disconnect();
        });
    }
    connect(integrationData) {
        let { accountId } = integrationData;

        accountId = accountId?.replace("https://www.extra-life.org/index.cfm?fuseaction=donordrive.participant&participantID=", "");

        if (accountId == null || isNaN(accountId)) {
            this.emit("disconnected", integrationDefinition.id);
            this.connected = false;
            return;
        }

        extraLifePollService.start(accountId);
    }
    disconnect() {
        this.connected = false;
        extraLifePollService.stop();
        this.emit("disconnected", integrationDefinition.id);
    }
    link() {}
    unlink() {
        if (this.connected) {
            this.connected = false;
            this.emit("disconnected", integrationDefinition.id);
        }
        extraLifePollService.stop();
    }
}

const integration = new ExtraLifeIntegration();

module.exports = {
    definition: integrationDefinition,
    integration: integration
};
