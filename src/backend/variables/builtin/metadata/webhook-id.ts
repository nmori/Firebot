import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "webhookId",
    description: "Webhook の ID を返します。",
    events: ["firebot:webhook-received"],
    type: "text",
    eventMetaKey: "webhookId"
});