import type { PluginWebhook, PluginWebhookEventHandler, WebhookConfig } from "../../types";

import JsonDbManager from "../database/json-db-manager";
import { SettingsManager } from "../common/settings-manager";
import frontendCommunicator from "../common/frontend-communicator";
import { maskPII } from "../utils";

type ExtraEvents = {
    "webhook-received": (data: {
        config: WebhookConfig;
        payload: unknown;
        rawPayload?: string;
        headers: Record<string, string>;
    }) => void;
};

class WebhookConfigManager extends JsonDbManager<WebhookConfig, ExtraEvents> {
    private _registeredPlugins: Record<string, PluginWebhookEventHandler> = {};

    constructor() {
        super("Webhook", "/webhooks", "Webhooks");

        // JP版: crowbar relay は無効化しているため、Webhook はローカルの HTTP サーバー
        // (/api/v1/webhooks/:webhookId) で受信する。受信処理は webhooks-api-controller が
        // "webhook-received" を emit し、Firebot イベントを発火する。
        this.on("items-changed", () => {
            this.triggerUiRefresh();
        });

        this.on("webhook-received", (data) => {
            if (SettingsManager.getSetting("WebhookDebugLogs")) {
                this.logger.debug("Webhook received:", maskPII(data));
            }

            const webhookConfig = data.config;
            if (!webhookConfig) {
                return;
            }

            for (const pluginId of Object.keys(this._registeredPlugins)) {
                if (webhookConfig.scriptId === pluginId) {
                    const event = {
                        webhook: this.toPublic(webhookConfig),
                        payload: data.payload,
                        rawPayload: data.rawPayload,
                        headers: data.headers ?? {}
                    };

                    try {
                        const handler = this._registeredPlugins[pluginId];
                        handler(event);
                    } catch (error) {
                        this.logger.warn(`Plugin ${pluginId} webhook handler threw`, error);
                    }
                }
            }
        });

        frontendCommunicator.onAsync("webhooks:ui-service-ready",
            async () => this.triggerUiRefresh()
        );

        frontendCommunicator.onAsync("webhooks:save", async (webhookConfig: WebhookConfig) =>
            this.saveItem(webhookConfig)
        );

        frontendCommunicator.on("webhooks:delete", (webhookConfigId: string) =>
            this.deleteItem(webhookConfigId)
        );
    }

    getWebhookUrlById(webhookId: string): string {
        const port = SettingsManager.getSetting("WebServerPort");
        return `http://localhost:${port}/api/v1/webhooks/${webhookId}`;
    }

    private toPublic(config: WebhookConfig): PluginWebhook {
        return { id: config.id, name: config.name };
    }

    findPluginWebhookByName(pluginId: string, webhookName: string) {
        return this.getAllItems()
            .find(w => w.name === webhookName && w.scriptId === pluginId);
    }

    getPluginWebhook(pluginId: string, webhookName: string): PluginWebhook {
        if (pluginId == null || pluginId.trim() === ""
            || webhookName == null || webhookName.trim() === "") {
            return null;
        }
        const found = this.findPluginWebhookByName(pluginId, webhookName);
        return found ? this.toPublic(found) : null;
    }

    getAllPluginWebhooks(pluginId: string): PluginWebhook[] {
        return this.getAllItems()
            .filter(w => w.scriptId === pluginId)
            .map(this.toPublic);
    }

    savePluginWebhook(pluginId: string, webhookName: string): PluginWebhook {
        if (pluginId == null || pluginId.trim() === ""
            || webhookName == null || webhookName.trim() === "") {
            return null;
        }
        const existing = this.findPluginWebhookByName(pluginId, webhookName);
        const saved = this.saveItem({
            name: webhookName,
            id: existing?.id,
            scriptId: pluginId
        });
        return saved ? this.toPublic(saved) : null;
    }

    deletePluginWebhook(pluginId: string, webhookName: string): boolean {
        if (pluginId == null || pluginId.trim() === ""
            || webhookName == null || webhookName.trim() === "") {
            return false;
        }
        const existing = this.findPluginWebhookByName(pluginId, webhookName);
        if (!existing) {
            return false;
        }
        this.deleteItem(existing.id);
        return true;
    }

    getPluginWebhookUrl(pluginId: string, webhookName: string): string {
        const found = this.findPluginWebhookByName(pluginId, webhookName);
        if (!found) {
            return null;
        }
        return this.getWebhookUrlById(found.id);
    }

    registerPluginHandler(pluginId: string, handler: PluginWebhookEventHandler) {
        if (pluginId == null || pluginId.trim() === "" || handler == null) {
            return false;
        }

        if (this._registeredPlugins[pluginId] != null) {
            this.logger.warn(`Plugin ${pluginId} already has a handler registered`);
            return false;
        }

        this._registeredPlugins[pluginId] = handler;
        this.logger.info(`Registered handler for plugin ${pluginId}`);
        return true;
    }

    unregisterPluginHandler(pluginId: string) {
        if (pluginId == null || pluginId.trim() === "") {
            return false;
        }

        if (this._registeredPlugins[pluginId] == null) {
            this.logger.warn(`Plugin ${pluginId} does not have a handler registered`);
            return false;
        }

        delete this._registeredPlugins[pluginId];
        this.logger.info(`Unregistered handler for plugin ${pluginId}`);
        return true;
    }

    triggerUiRefresh(): void {
        this.logger.debug("Triggering UI refresh");
        frontendCommunicator.send("webhooks:updated", this.getAllItems());
    }
}

const webhookConfigManager = new WebhookConfigManager();

export = webhookConfigManager;