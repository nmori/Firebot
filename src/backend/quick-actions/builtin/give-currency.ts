import { SystemQuickAction } from "../../../types/quick-actions";
import frontendCommunicator from "../../common/frontend-communicator";

const GiveCurrencyQuickAction: SystemQuickAction = {
    definition: {
        id: "firebot:give-currency",
        name: "通貨を贈る",
        type: "system",
        icon: "far fa-coin"
    },
    onTriggerEvent: () => {
        frontendCommunicator.send("trigger-quickaction:give-currency");
    }
};

export { GiveCurrencyQuickAction };