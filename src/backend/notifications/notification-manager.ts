import { JsonDB } from "node-json-db";
import { randomUUID } from "crypto";

import { ProfileManager } from "../common/profile-manager";
import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";
import { deepClone } from "../utils";

export enum NotificationSource {
    EXTERNAL = "external",
    INTERNAL = "internal",
    SCRIPT = "script"
}

export enum NotificationType {
    INFO = "info",
    TIP = "tip",
    UPDATE = "update",
    ALERT = "alert"
}

export type NotificationBase = {
    title: string;
    message: string;
    type: NotificationType;
    source?: NotificationSource;
    scriptName?: string;
    externalId?: string;
    metadata?: Record<string, unknown>;
};

export type Notification = NotificationBase & {
    id: string;
    timestamp: Date;
    saved: boolean;
    read: boolean;
};

interface NotificationCache {
    dbVersion?: string;
    notifications: Notification[];
    knownExternalIds: string[];
}

class NotificationManager {
    private _externalCheckInterval: NodeJS.Timeout;
    private _notificationCache: NotificationCache = {
        dbVersion: "2",
        notifications: [],
        knownExternalIds: []
    };

    constructor() {
        frontendCommunicator.on("notifications:get-all-notifications", () => {
            return this.getNotifications();
        });

        frontendCommunicator.on("notifications:mark-notification-as-read", (id: string) => {
            this.markNotificationAsRead(id);
        });

        frontendCommunicator.on("notifications:delete-notification", (id: string) => {
            this.deleteNotification(id);
        });

        frontendCommunicator.on("notifications:start-external-notification-check", () => {
            this.startExternalNotificationCheck();
        });
    }

    private getNotificationDb(): JsonDB {
        return ProfileManager.getJsonDbInProfile("notifications");
    }

    private checkNotificationDbVersion(): boolean {
        try {
            return this.getNotificationDb().getData("/dbVersion") === "2";
        } catch {
            logger.debug("No notification dbVersion detected.");
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
            source: notification.source ?? NotificationSource.INTERNAL,
            type: notification.type ?? NotificationType.INFO
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
}

const manager = new NotificationManager();

export { manager as NotificationManager };