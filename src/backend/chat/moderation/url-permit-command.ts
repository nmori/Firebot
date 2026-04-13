import type { SystemCommand } from "../../../types/commands";
import { CommandManager } from "../commands/command-manager";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";

class PermitManager {
    private readonly _permidCommandId: string = "firebot:moderation:url:permit";
    private _tempPermittedUsers: string[] = [];

    private readonly _permitCommand: SystemCommand<{
        permitDisplayTemplate: string;
        permitDuration: number;
    }> = {
        definition: {
            id: this._permidCommandId,
            name: "URL許可",
            active: true,
            trigger: "!permit",
            usage: "[対象]",
            description: "一定時間、視聴者が URL を投稿できるようにします（モデレーション -> URL モデレーションを参照）。",
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
                    title: "秒数",
                    default: 30,
                    description: "!permit コマンド使用後に、視聴者が URL を投稿できる秒数。"
                },
                permitDisplayTemplate: {
                    type: "string",
                    title: "出力テンプレート",
                    description: "permit コマンド使用時に表示するチャットメッセージ（空欄なら送信しません）。",
                    tip: "変数: {target}, {duration}",
                    default: `{target} さん、{duration} 秒間チャットにリンクを投稿できます。`,
                    useTextArea: true
                }
            }
        },
        onTriggerEvent: async (event) => {
            const { command, commandOptions, userCommand } = event;
            let { args } = userCommand;

            if (command.scanWholeMessage) {
                args = args.filter(a => a !== command.trigger);
            }

            if (args.length !== 1) {
                await TwitchApi.chat.sendChatMessage("コマンドの使い方が正しくありません。", null, true);
                return;
            }

            const target = args[0].replace("@", "");
            const normalizedTarget = target.toLowerCase();
            if (!target) {
                await TwitchApi.chat.sendChatMessage("許可するユーザーを指定してください。", null, true);
                return;
            }

            this._tempPermittedUsers.push(normalizedTarget);
            logger.debug(`URL moderation: ${target} has been temporary permitted to post a URL.`);

            const message = commandOptions.permitDisplayTemplate
                .replaceAll("{target}", target)
                .replaceAll("{duration}", commandOptions.permitDuration.toString());

            if (message) {
                await TwitchApi.chat.sendChatMessage(message, null, true);
            }

            setTimeout(() => {
                this._tempPermittedUsers = this._tempPermittedUsers.filter(user => user !== normalizedTarget);
                logger.debug(`URL moderation: Temporary URL permission for ${target} expired.`);
            }, commandOptions.permitDuration * 1000);
        }
    };

    hasTemporaryPermission(username: string): boolean {
        return this._tempPermittedUsers.includes(username);
    }

    registerPermitCommand(): void {
        if (!CommandManager.hasSystemCommand(this._permidCommandId)) {
            CommandManager.registerSystemCommand(this._permitCommand);
        }
    }

    unregisterPermitCommand(): void {
        CommandManager.unregisterSystemCommand(this._permidCommandId);
    }
}

const manager = new PermitManager();

frontendCommunicator.on("registerPermitCommand", () => {
    manager.registerPermitCommand();
});

frontendCommunicator.on("unregisterPermitCommand", () => {
    manager.unregisterPermitCommand();
});

export = manager;