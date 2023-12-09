"use strict";

const SystemQuickAction = require("../quick-action");
const windowManagement = require("../../app-management/electron/window-management");

class StreamPreviewQuickAction extends SystemQuickAction {
    constructor() {
        super({
            id: "firebot:stream-preview",
            name: "配信プレビューを表示",
            type: "system",
            icon: "far fa-tv-alt"
        });
    }

    onTriggerEvent() {
        windowManagement.createStreamPreviewWindow();
    }
}

module.exports = new StreamPreviewQuickAction().toJson();