"use strict";

const SystemQuickAction = require("../quick-action");
const frontendCommunicator = require("../../common/frontend-communicator");

class StreamInfoQuickAction extends SystemQuickAction {
    constructor() {
        super({
            id: "firebot:stream-info",
            name: "ストリーム情報の編集",
            type: "system",
            icon: "far fa-pencil"
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:stream-info");
    }
}

module.exports = new StreamInfoQuickAction().toJson();