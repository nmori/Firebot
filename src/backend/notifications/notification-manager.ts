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

type ExternalNotification = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
};

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

const EXTERNAL_NOTIFICATION_SOURCE_URL = "https://api.crowbar.tools/v1/notifications/v5";

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

    private getKnownExternalNotifications(): string[] {
        const externalNotificationIds = this.getNotificationDb().getData("/knownExternalIds") as string[];
        return externalNotificationIds ? externalNotificationIds : [];
    }

    private setKnownExternalNotifications(ids: string[]): void {
        this.getNotificationDb().push("/knownExternalIds", ids);
    }

    private async loadExternalNotifications(): Promise<void> {
        try {
            const response = await fetch(EXTERNAL_NOTIFICATION_SOURCE_URL);
            const externalNotifications = await response.json() as ExternalNotification[];

            const knownExtNotis = this.getKnownExternalNotifications();

            const newKnownExtNotis: string[] = [];

            externalNotifications.forEach((externalNotification) => {
                const n = this.localizeExternalNotification(externalNotification);

                newKnownExtNotis.push(n.id);

                const existingExternalNotification = this._notificationCache.notifications.find(
                    (cachedNotification) => cachedNotification.source === NotificationSource.EXTERNAL && cachedNotification.externalId === n.id
                );

                if (existingExternalNotification != null) {
                    const hasChanged =
                        existingExternalNotification.title !== n.title
                        || existingExternalNotification.message !== n.message
                        || existingExternalNotification.type !== n.type;

                    if (hasChanged) {
                        existingExternalNotification.title = n.title;
                        existingExternalNotification.message = n.message;
                        existingExternalNotification.type = n.type;
                        existingExternalNotification.saved = true;

                        frontendCommunicator.send("notifications:notification-updated", existingExternalNotification);
                    }
                }

                if (!knownExtNotis.includes(n.id)) {
                    this.addNotification({
                        title: n.title,
                        message: n.message,
                        type: n.type,
                        source: NotificationSource.EXTERNAL,
                        externalId: n.id
                    }, true);
                }
            });

            this.setKnownExternalNotifications(newKnownExtNotis);
            this.saveNotifications();

        } catch (err) {
            const error = err as Error;
            logger.error("Error loading external notifications", error.message);
        }
    }

    private localizeExternalNotification(notification: ExternalNotification): ExternalNotification {
        if (notification.title === "Feature YOUR stream on the Firebot website!") {
            return {
                ...notification,
                title: "Firebot公式サイトであなたの配信を紹介しよう！",
                message: "こんにちは、Firebotユーザーのみなさん！あなたの配信を Firebot 公式サイトで紹介できるのをご存知ですか？\n設定 → 一般 で「Feature My Stream」を有効にしてください。\n有効化すると、Firebot を実行したまま Twitch で配信中のときに、あなたの配信が自動で公式サイトに表示されます。"
            };
        }

        return notification;
    }

    startExternalNotificationCheck(): void {
        if (this._externalCheckInterval == null) {
            void this.loadExternalNotifications();

            this._externalCheckInterval = setInterval(
                () => this.loadExternalNotifications(), 5 * 60 * 1000);
        }
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