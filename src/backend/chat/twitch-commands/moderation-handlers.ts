import twitchApi from "../../twitch-api/api";
import chatRolesManager from "../../roles/chat-roles-manager";
import { TwitchSlashCommandHandler } from "../twitch-slash-command-handler";
import { TwitchCommandHelpers } from "./twitch-command-helpers";

export const timeoutHandler: TwitchSlashCommandHandler<[string, number, string]> = {
    commands: ["/timeout"],
    validateArgs: ([targetUsername, duration, ...reason]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        const parsedDuration = TwitchCommandHelpers.getRawDurationInSeconds(duration);
        if (parsedDuration == null) {
            return {
                success: false,
                errorMessage: "正しい期間を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);
        const formattedReason: string = reason == null ? null : reason.join(" ");

        return {
            success: true,
            args: [targetUsername, parsedDuration, formattedReason]
        };
    },
    handle: async ([targetUsername, duration, reason]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        return await twitchApi.moderation.timeoutUser(targetUserId, duration, reason);
    }
};

export const banHandler: TwitchSlashCommandHandler<[string, string]> = {
    commands: ["/ban"],
    validateArgs: ([targetUsername, ...reason]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);
        const formattedReason: string = reason == null ? null : reason.join(" ");

        return {
            success: true,
            args: [targetUsername, formattedReason]
        };
    },
    handle: async ([targetUsername, reason]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        return await twitchApi.moderation.banUser(targetUserId, reason);
    }
};

export const unbanHandler: TwitchSlashCommandHandler<[string]> = {
    commands: ["/unban", "/untimeout"],
    validateArgs: ([targetUsername]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);

        return {
            success: true,
            args: [targetUsername]
        };
    },
    handle: async ([targetUsername]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        return await twitchApi.moderation.unbanUser(targetUserId);
    }
};

export const vipHandler: TwitchSlashCommandHandler<[string]> = {
    commands: ["/vip"],
    validateArgs: ([targetUsername]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);

        return {
            success: true,
            args: [targetUsername]
        };
    },
    handle: async ([targetUsername]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        const result = await twitchApi.moderation.addChannelVip(targetUserId);
        if (result === true) {
            chatRolesManager.addVipToVipList(targetUsername);
        }
        return result;
    }
};

export const unvipHandler: TwitchSlashCommandHandler<[string]> = {
    commands: ["/unvip"],
    validateArgs: ([targetUsername]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);

        return {
            success: true,
            args: [targetUsername]
        };
    },
    handle: async ([targetUsername]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        const result = await twitchApi.moderation.removeChannelVip(targetUserId);
        if (result === true) {
            chatRolesManager.removeVipFromVipList(targetUsername);
        }
        return result;
    }
};

export const modHandler: TwitchSlashCommandHandler<[string]> = {
    commands: ["/mod"],
    validateArgs: ([targetUsername]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);

        return {
            success: true,
            args: [targetUsername]
        };
    },
    handle: async ([targetUsername]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        return await twitchApi.moderation.addChannelModerator(targetUserId);
    }
};

export const unmodHandler: TwitchSlashCommandHandler<[string]> = {
    commands: ["/unmod"],
    validateArgs: ([targetUsername]) => {
        if (targetUsername == null || targetUsername.length < 1) {
            return {
                success: false,
                errorMessage: "ユーザ名を入力してください"
            };
        }

        targetUsername = TwitchCommandHelpers.getNormalizedUsername(targetUsername);

        return {
            success: true,
            args: [targetUsername]
        };
    },
    handle: async ([targetUsername]) => {
        const targetUserId = (await twitchApi.users.getUserByName(targetUsername))?.id;

        if (targetUserId == null) {
            return false;
        }

        return await twitchApi.moderation.removeChannelModerator(targetUserId);
    }
};