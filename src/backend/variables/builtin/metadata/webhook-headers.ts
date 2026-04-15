import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "webhookHeaders",
    description: "Webhook のヘッダー情報を返します。",
    events: ["firebot:webhook-received"],
    type: "text",
    eventMetaKey: "webhookHeaders"
});