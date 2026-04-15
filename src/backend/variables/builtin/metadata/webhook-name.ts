import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "webhookName",
    description: "Webhook の名前を返します。",
    events: ["firebot:webhook-received"],
    type: "text",
    eventMetaKey: "webhookName"
});