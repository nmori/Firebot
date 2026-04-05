"use strict";
const EventEmitter = require("events");
const { extraLifePollService } = require("./extralife-poll");
const extraLifeVariableLoader = require("./variables/extralife-variable-loader");

const integrationDefinition = {
    id: "extralife",
    name: "ExtraLife",
    description: "ExtraLife 寄付イベント",
    connectionToggle: true,
    linkType: "id",
    idDetails: {
        steps:
`1. **Your Page** ナビリンクから ExtraLife ページを開きます。

2. URL バーの "Participant ID" を確認します。\`participantID=\` の後ろの数字が対象です。

3. その Participant ID を下に貼り付けてください。`
    }
};

class ExtraLifeIntegration extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
    }
    init() {
        const { EventManager } = require("../../../events/event-manager");
        EventManager.registerEventSource({
            id: "extralife",
            name: "ExtraLife",
            description: "ExtraLife 由来の寄付イベント",
            events: [
                {
                    id: "donation",
                    name: "寄付",
                    description: "誰かがあなたの ExtraLife キャンペーンへ寄付したとき。",
                    cached: false,
                    manualMetadata: {
                        from: "ExtraLife",
                        formattedDonationAmount: 5,
                        donationAmount: 5,
                        donationMessage: "テストメッセージ"
                    },
                    isIntegration: true,
                    activityFeed: {
                        icon: "fad fa-money-bill",
                        getMessage: (eventData) => {
                            return `**${eventData.from}** が ExtraLife に **${eventData.formattedDonationAmount}** を寄付${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                        }
                    }
                }
            ]
        });

        extraLifeVariableLoader.registerVariables();

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