"use strict";

const logger = require("../../logwrapper");
const commandManager = require("../commands/CommandManager");
const frontendCommunicator = require("../../common/frontend-communicator");

const PERMIT_COMMAND_ID = "firebot:moderation:url:permit";
let tempPermittedUsers = [];

const permitCommand = {
    definition: {
        id: PERMIT_COMMAND_ID,
        name: "Permit",
        active: true,
        trigger: "!permit",
        usage: "[ターゲット]",
        description: "閲覧者が設定された期間だけurlを投稿することを許可する(Moderation → Url Moderationを参照).",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        restrictionData: {
            restrictions: [
                {
                    id: "sys-cmd-mods-only-perms",
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: [
                        "broadcaster",
                        "mod"
                    ]
                }
            ]
        },
        options: {
            permitDuration: {
                type: "number",
                title: "継続時間(秒)",
                default: 30,
                description: "permitコマンド使用後、視聴者がリンクを貼るまでの時間。"
            },
            permitDisplayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "permitコマンド使用時に表示されるチャットメッセージ。",
                tip: "変数: {target}, {duration}",
                default: `{target}、{duration}秒以内にあなたのURLをチャットに投稿してください。`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async event => {
        const twitchChat = require("../twitch-chat");
        const { command, commandOptions, userCommand } = event;
        let { args } = userCommand;

        if (command.scanWholeMessage) {
            args = args.filter(a => a !== command.trigger);
        }

        if (args.length !== 1) {
            await twitchChat.sendChatMessage("コマンドの使い方が正しくありません");
            return;
        }

        const target = args[0].replace("@", "");
        if (!target) {
            await twitchChat.sendChatMessage("Please specify a user to permit.");
            return;
        }

        tempPermittedUsers.push(target);
        logger.debug(`Url moderation: ${target} has been temporary permitted to post a url...`);

        const message = commandOptions.permitDisplayTemplate.replace("{target}", target).replace("{duration}", commandOptions.permitDuration);

        if (message) {
            await twitchChat.sendChatMessage(message);
        }

        setTimeout(() => {
            tempPermittedUsers = tempPermittedUsers.filter(user => user !== target);
            logger.debug(`Url moderation: Temporary url permission for ${target} expired.`);
        }, commandOptions.permitDuration * 1000);
    }
};

function hasTemporaryPermission(username) {
    return tempPermittedUsers.includes(username);
}

function registerPermitCommand() {
    if (!commandManager.hasSystemCommand(PERMIT_COMMAND_ID)) {
        commandManager.registerSystemCommand(permitCommand);
    }
}

function unregisterPermitCommand() {
    commandManager.unregisterSystemCommand(PERMIT_COMMAND_ID);
}

frontendCommunicator.on("registerPermitCommand", () => {
    registerPermitCommand();
});

frontendCommunicator.on("unregisterPermitCommand", () => {
    unregisterPermitCommand();
});

exports.hasTemporaryPermission = hasTemporaryPermission;
exports.registerPermitCommand = registerPermitCommand;
exports.unregisterPermitCommand = unregisterPermitCommand;