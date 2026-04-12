import { Request, Response } from "express";
import webhookConfigManager from "../../../../backend/webhooks/webhook-config-manager";
import { EventManager } from "../../../../backend/events/event-manager";

export function receiveWebhook(req: Request, res: Response): void {
    const webhookId = req.params.webhookId;
    const webhookConfig = webhookConfigManager.getItem(webhookId);

    if (!webhookConfig) {
        res.status(404).send({
            status: "error",
            message: `Webhook '${webhookId}' not found`
        });
        return;
    }

    let payload = req.body;
    const rawPayload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const headers = req.headers as Record<string, string>;

    if (typeof payload === "string") {
        try {
            payload = JSON.parse(payload);
        } catch {
            // keep as string
        }
    }

    webhookConfigManager.emit("webhook-received", {
        config: webhookConfig,
        payload,
        rawPayload,
        headers
    });

    void EventManager.triggerEvent("firebot", "webhook-received", {
        webhookId: webhookConfig.id,
        webhookName: webhookConfig.name,
        webhookPayload: payload,
        webhookRawPayload: rawPayload,
        webhookHeaders: headers
    });

    res.status(200).send({ status: "success" });
}
