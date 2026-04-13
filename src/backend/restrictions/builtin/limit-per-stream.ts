/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import type { Trigger } from "../../../types/triggers";

import { AccountAccess } from "../../common/account-access";
import connectionManager from "../../common/connection-manager";
import frontendCommunicator from "../../common/frontend-communicator";

type RestrictionData = {
    perUserLimit?: number;
    globalLimit?: number;
};

type CommandUsages = {
    globalUsages: number;
    perUserUsages: Record<string, number>;
};

let usageCache: Record<string, CommandUsages> = {};

// clear cache when stream changes
connectionManager.on("streamerOnlineChange", () => {
    usageCache = {};
});

function getCommandKey(trigger: Trigger, inherited: boolean) {
    const commandId = trigger.metadata.command?.id;
    const subcommandId = trigger.metadata.userCommand?.subcommandId;
    if (inherited || !subcommandId) {
        return commandId;
    }
    return `${commandId}::${subcommandId}`;
}

function getUsages(commandKey: string): CommandUsages {
    const usages = usageCache[commandKey];

    return usages ?? { globalUsages: 0, perUserUsages: {} };
}

function incrementUsages(commandKey: string, userKey: string) {
    const usages = getUsages(commandKey);

    usages.globalUsages += 1;
    usages.perUserUsages[userKey] = (usages.perUserUsages[userKey] ?? 0) + 1;

    usageCache[commandKey] = usages;
}

const limitPerStreamRestriction: RestrictionType<RestrictionData> = {
    definition: {
        id: "firebot:limit-per-stream",
        name: "配信ごとの使用回数制限",
        description: "1回の配信でコマンドを使用できる回数を制限します。",
        triggers: ["command"]
    },
    optionsTemplate: `
        <div>
            <div class="modal-subheader" style="padding: 0 0 4px 0">
                全体上限
            </div>
            <firebot-input
              placeholder-text="Enter number"
              input-type="number"
              disable-variables="true"
              model="restriction.globalLimit"
            />
            <div class="modal-subheader" style="padding: 0 0 4px 0; margin-top: 8px">
                ユーザーごとの上限
            </div>
            <firebot-input
              placeholder-text="Enter number"
              input-type="number"
              disable-variables="true"
              model="restriction.perUserLimit"
            />
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const limits: string[] = [];
        if (restriction.perUserLimit) {
            limits.push(`ユーザーごと: ${restriction.perUserLimit}`);
        }
        if (restriction.globalLimit) {
            limits.push(`全体: ${restriction.globalLimit}`);
        }
        if (limits.length === 0) {
            return "上限未設定";
        }
        return limits.join(", ");
    },
    predicate: async (triggerData, restrictionData, inherited) => {
        return new Promise((resolve, reject) => {
            const streamer = AccountAccess.getAccounts().streamer;

            if (!streamer.loggedIn) {
                return reject("配信者アカウントがログインしていません。");
            }

            const username = triggerData.metadata.username;
            if (!username) {
                return reject("トリガーデータにユーザー名がありません。");
            }

            const commandId = triggerData.metadata.command?.id;
            if (!commandId) {
                return reject("コマンドトリガーのみ対応しています。");
            }

            const isOnline = connectionManager.streamerIsOnline();

            if (!isOnline) {
                return reject("配信者が配信中ではありません。");
            }

            const { perUserLimit, globalLimit } = restrictionData;

            const usages = getUsages(getCommandKey(triggerData, inherited));

            if (globalLimit && usages.globalUsages >= globalLimit) {
                return reject("この配信での全体上限に達しました。");
            }

            if (perUserLimit && (usages.perUserUsages[username] ?? 0) >= perUserLimit) {
                return reject("この配信でのあなたの使用上限に達しました。");
            }

            return resolve(true);
        });
    },
    onSuccessful: (triggerData, _, inherited) => {
        const commandId = triggerData.metadata.command?.id;
        if (!commandId) {
            return;
        }

        const username = triggerData.metadata.username;
        if (!username) {
            return;
        }

        incrementUsages(getCommandKey(triggerData, inherited), username);
    }
};

frontendCommunicator.on("reset-all-per-stream-command-usages", () => {
    usageCache = {};
});

frontendCommunicator.on("reset-per-stream-usages-for-command", (commandId: string) => {
    if (!commandId) {
        return;
    }
    // remove all usages for base command and subcommands
    const commandKeys = Object.keys(usageCache).filter(key => key.startsWith(commandId));
    commandKeys.forEach(key => delete usageCache[key]);
});

export = limitPerStreamRestriction;