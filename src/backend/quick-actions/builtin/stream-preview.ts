import type { SystemQuickAction } from "../../../types";

import windowManagement from "../../app-management/electron/window-management";

const StreamPreviewQuickAction: SystemQuickAction = {
    definition: {
        id: "firebot:stream-preview",
        name: "配信プレビューを表示",
        type: "system",
        icon: "far fa-tv-alt"
    },
    onTriggerEvent: () => {
        windowManagement.createStreamPreviewWindow();
    }
};

export { StreamPreviewQuickAction };