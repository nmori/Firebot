import { JsonDB } from "node-json-db";
import { randomUUID } from "crypto";

import type {
    Notification,
    NotificationBase,
    NotificationCache
} from "../../types";

import { ProfileManager } from "../common/profile-manager";
import frontendCommunicator from "../common/frontend-communicator";
import { LoggerCache } from "../logger-cache";
import { deepClone } from "../utils";


class NotificationManager {
    private logger = LoggerCache.getLogger("Notifications");
    private _externalCheckInterval: NodeJS.Timeout;
    private _notificationCache: NotificationCache = {
        dbVersion: "2",
        notifications: [],
        knownExternalIds: []
    };

    constructor() {
        frontendCommunicator.onAsync("notifications:ui-service-ready", async () => {
            this.triggerUiRefresh();
            this.startExternalNotificationCheck();
        });

        frontendCommunicator.onAsync("notifications:get-all-notifications", async () => {
            return this.getNotifications();
        });

        frontendCommunicator.on("notifications:mark-notification-as-read", (id: string) => {
            this.markNotificationAsRead(id);
        });

        frontendCommunicator.on("notifications:delete-notification", (id: string) => {
            this.deleteNotification(id);
        });
    }

    private getNotificationDb(): JsonDB {
        return ProfileManager.getJsonDbInProfile("notifications");
    }

    private checkNotificationDbVersion(): boolean {
        try {
            return this.getNotificationDb().getData("/dbVersion") === "2";
        } catch {
            this.logger.debug("No notification dbVersion detected.");
            return false;
        }
    }

    loadNotificationCache(): void {
        this._notificationCache = {
            dbVersion: "2",
            notifications: [],
            knownExternalIds: []
        };

        if (this.checkNotificationDbVersion() !== true) {
            this.getNotificationDb().push("/", this._notificationCache);
        }

        this._notificationCache = this.getNotificationDb().getData("/") as NotificationCache;
    }

    addNotification(notification: NotificationBase, permanentlySave = false): Notification {
        const newNotification: Notification = {
            ...notification,
            id: randomUUID(),
            timestamp: new Date(),
            read: false,
            saved: permanentlySave ?? false,
            source: notification.source ?? "internal",
            type: notification.type ?? "info"
        };

        this. _notificationCache.notifications.push(newNotification);
        frontendCommunicator.send("notifications:new-notification", newNotification);
        this.saveNotifications();

        return newNotification;
    }

    private saveNotifications(): void {
        this.getNotificationDb().push("/notifications",
            this._notificationCache.notifications.filter(n => n.saved === true));
    }

    getNotifications(): Notification[] {
        return deepClone(this._notificationCache.notifications);
    }

    deleteNotification(id: string): void {
        this._notificationCache.notifications =
            this._notificationCache.notifications.filter(n => n.id !== id);

        this.saveNotifications();

        frontendCommunicator.send("notifications:notification-deleted", id);
    }

    markNotificationAsRead(id: string): void {
        const notification = this._notificationCache.notifications.find(n => n.id === id);

        if (notification != null) {
            notification.read = true;
            this.saveNotifications();
        }

        frontendCommunicator.send("notifications:notification-marked-as-read", id);
    }

    getNotification(id: string): Notification | null {
        return this._notificationCache.notifications.find(n => n.id === id) ?? null;
    }

    startExternalNotificationCheck(): void {
        // External notifications from api.crowbar.tools are disabled in this fork
    }

    stopExternalNotificationCheck(): void {
        if (this._externalCheckInterval != null) {
            clearInterval(this._externalCheckInterval);
            this._externalCheckInterval = null;
        }
    }

    migrateLegacyScriptNotifications(): void {
        // @ts-ignore
        if (this._notificationCache.notifications.some(n => n.source === "script")) {
            const updatedNotifications = this._notificationCache.notifications
                .map((n) => {
                // @ts-ignore
                    if (n.source === "script") {
                        return {
                            ...n,
                            source: "plugin",
                            // @ts-ignore
                            pluginName: n.scriptName as string,
                            scriptName: undefined
                        } as Notification;
                    }
                    return n;
                });

            this._notificationCache.notifications = updatedNotifications;
            this.saveNotifications();
        }
    }

    triggerUiRefresh(): void {
        this.logger.debug("Triggering UI refresh");
        frontendCommunicator.send("notifications:notifications-updated", this.getNotifications());
    }
}

const manager = new NotificationManager();

export { manager as NotificationManager };