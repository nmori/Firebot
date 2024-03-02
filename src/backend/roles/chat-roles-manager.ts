import axios from "axios";
import { HelixUserRelation } from "@twurple/api";

import { BasicViewer } from "../../types/viewers";
import logger from "../logwrapper";
import accountAccess from "../common/account-access";
import twitchApi from "../twitch-api/api";

const VIEWLIST_BOTS_URL = "https://api.twitchinsights.net/v1/bots/all";

interface KnownBot {
    id?: string;
    username: string;
    channels: number;
}

interface KnownBotServiceResponse {
    bots: Array<[string, number, number]>
}

class ChatRolesManager {
    private _knownBots: KnownBot[] = [];
    private _vips: BasicViewer[] = [];

    async cacheViewerListBots(): Promise<void> {
        if (this._knownBots?.length) {
            return;
        }

        try {
            const responseData = (await axios.get<KnownBotServiceResponse>(VIEWLIST_BOTS_URL)).data;
            if (responseData?.bots != null) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                this._knownBots = responseData.bots.map(([username, channels, _lastSeen]) => {
                    return {
                        username: username.toLowerCase(),
                        channels: channels
                    };
                }) ?? [];
            }
        } catch {
            // silently fail
        }
    }

    async userIsKnownBot(userId: string): Promise<boolean> {
        if (!userId?.length) {
            return false;
        }

        if (this._knownBots?.length) {
            if (this._knownBots.some(b => b.id === userId) === true) {
                return true;
            }

            const user = await twitchApi.users.getUserById(userId);
            if (user != null) {
                const username = user.name.toLowerCase();
                const bot = this._knownBots.find(b => b.username === username);

                if (bot != null) {
                    bot.id = user.id;
                    return true;
                }
            }
        }

        return false;
    }

    loadUsersInVipRole(usersInVipRole: HelixUserRelation[]): void {
        this._vips = usersInVipRole.map((u) => {
            return {
                id: u.id,
                username: u.name,
                displayName: u.displayName
            };
        });
    }

    addVipToVipList(viewer: BasicViewer): void {
        if (!this._vips.some(v => v.id === viewer.id)) {
            this._vips.push(viewer);
        }
    }

    removeVipFromVipList(userId: string): void {
        this._vips = this._vips.filter(v => v.id !== userId);
    }

    private async getUserSubscriberRole(userIdOrName: string): Promise<string> {
        if (userIdOrName == null || userIdOrName === "") {
            return "";
        }

        const isName = !new RegExp(/^\d+$/).test(userIdOrName);

        const client = twitchApi.streamerClient;
        const userId = isName
            ? (await twitchApi.users.getUserByName(userIdOrName)).id
            : userIdOrName;

        const streamer = accountAccess.getAccounts().streamer;
        const subInfo = await client.subscriptions.getSubscriptionForUser(streamer.userId, userId);

        if (subInfo == null || subInfo.tier == null) {
            return null;
        }

        let role = "";
        switch (subInfo.tier) {
            case "1000":
                role = "tier1";
                break;
            case "2000":
                role = "tier2";
                break;
            case "3000":
                role = "tier3";
                break;
        }

        return role;
    }

    async getUsersChatRoles(userId: string): Promise<string[]> {
        if (!userId?.length) {
            return [];
        }

        const roles: string[] = [];

        try {
            const client = twitchApi.streamerClient;

            if (await this.userIsKnownBot(userId) === true) {
                roles.push("viewerlistbot");
            }

            const streamer = accountAccess.getAccounts().streamer;
            if (userId === streamer.userId) {
                roles.push("broadcaster");
            }

            if (streamer.broadcasterType !== "") {
                const subscriberRole = await this.getUserSubscriberRole(userId);
                if (subscriberRole != null) {
                    roles.push("sub");
                    roles.push(subscriberRole);
                }
            }

            if (this._vips.some(v => v.id === userId)) {
                roles.push("vip");
            }

            const moderators = (await client.moderation.getModerators(streamer.userId)).data;
            if (moderators.some(m => m.userId === userId)) {
                roles.push("mod");
            }

            return roles;
        } catch (err) {
            logger.error("Failed to get user chat roles", err);
            return [];
        }
    }
}

const chatRolesManager = new ChatRolesManager();

export = chatRolesManager;