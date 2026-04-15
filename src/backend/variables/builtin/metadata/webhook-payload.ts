import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "webhookPayload",
    description: "Webhook のペイロードを返します。",
    events: ["firebot:webhook-received"],
    type: "ALL",
    eventMetaKey: "webhookPayload"
});