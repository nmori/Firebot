"use strict";

const QuickAction = require("../quick-action");
const frontendCommunicator = require("../../common/frontend-communicator");

class GiveCurrencyQuickAction extends QuickAction {
    constructor() {
        super({
            id: "firebot:give-currency",
            name: "通貨を贈る",
            type: "system",
            icon: "far fa-coin"
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:give-currency");
    }
}

module.exports = new GiveCurrencyQuickAction().toJson();