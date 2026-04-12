import { WebhookConfig } from "../../types/webhooks";

import JsonDbManager from "../database/json-db-manager";
import { SettingsManager } from "../common/settings-manager";
import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";
import { maskPII } from "../utils";

type ExtraEvents = {
    "webhook-received": (data: {
        config: WebhookConfig,
        payload: unknown,
        rawPayload?: string,
        headers: Record<string, string>
    }) => void;
};

class WebhookConfigManager extends JsonDbManager<WebhookConfig, ExtraEvents> {
    constructor() {
        super("Webhooks", "/webhooks");

        this.on("items-changed", () => {
            frontendCommunicator.send("webhooks:updated", this.getAllItems());
        });

        this.on("webhook-received", (data) => {
            if (SettingsManager.getSetting("WebhookDebugLogs")) {
                logger.debug("Webhook received:", maskPII(data));
            }
        });
    }

    getWebhookUrlById(webhookId: string): string {
        const port = SettingsManager.getSetting("WebServerPort");
        return `http://localhost:${port}/api/v1/webhooks/${webhookId}`;
    }
}

const webhookConfigManager = new WebhookConfigManager();

frontendCommunicator.onAsync("webhooks:get-all", async () =>
    webhookConfigManager.getAllItems()
);

frontendCommunicator.onAsync("webhooks:save", async (webhookConfig: WebhookConfig) =>
    webhookConfigManager.saveItem(webhookConfig)
);

frontendCommunicator.on("webhooks:delete", (webhookConfigId: string) =>
    webhookConfigManager.deleteItem(webhookConfigId)
);

export = webhookConfigManager;
