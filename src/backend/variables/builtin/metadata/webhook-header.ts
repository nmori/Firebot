import type { ReplaceVariable } from "../../../../types/variables";

export const webhookHeader: ReplaceVariable = {
    definition: {
        handle: "webhookHeader",
        usage: "webhookHeader[key]",
        description: "Webhook リクエストに含まれる指定ヘッダーの値を返します。",
        possibleDataOutput: ["text"],
        triggers: {
            ["event"]: ["firebot:webhook-received"],
            ["manual"]: true
        }
    },
    evaluator(trigger, key: string) {
        const headers = (trigger?.metadata?.eventData?.webhookHeaders ?? {}) as Record<string, string>;
        return headers[key] ?? "";
    }
};

export default webhookHeader;