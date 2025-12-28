import { SystemQuickAction } from "../../../types/quick-actions";
import frontendCommunicator from "../../common/frontend-communicator";

const StreamInfoQuickAction: SystemQuickAction = {
    definition: {
        id: "firebot:stream-info",
        name: "配信情報を編集",
        type: "system",
        icon: "far fa-pencil"
    },
    onTriggerEvent: () => {
        frontendCommunicator.send("trigger-quickaction:stream-info");
    }
};

export { StreamInfoQuickAction };