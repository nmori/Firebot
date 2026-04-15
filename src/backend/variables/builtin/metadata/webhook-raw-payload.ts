import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "webhookRawPayload",
    description: "Webhook の生のペイロード（テキスト）を返します。",
    events: ["firebot:webhook-received"],
    type: "text",
    eventMetaKey: "webhookRawPayload"
});