import { SystemCommand } from "../../../types/commands";
import logger from "../../logwrapper";
import commandManager from "../commands/command-manager";
import frontendCommunicator from "../../common/frontend-communicator";
import { TwitchApi } from "../../streaming-platforms/twitch/api";

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
            description: "視聴者が一定時間URLを投稿することを許可します（モデレーション -> URLモデレーション を参照）。",
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
                    title: "許可時間（秒）",
                    default: 30,
                    description: "!permitコマンドが使用された後、視聴者がURLを投稿できる時間。"
                },
                permitDisplayTemplate: {
                    type: "string",
                    title: "出力テンプレート",
                    description: "permitコマンドが使用されたときに表示されるチャットメッセージ（空欄の場合はメッセージなし）。",
                    tip: "変数: {target}, {duration}",
                    default: `{target} さん、{duration} 秒以内にチャットにリンクを投稿してください。`,
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
                await TwitchApi.chat.sendChatMessage("コマンドの使い方が間違っています！", null, true);
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
        if (!commandManager.hasSystemCommand(this._permidCommandId)) {
            commandManager.registerSystemCommand(this._permitCommand);
        }
    }

    unregisterPermitCommand(): void {
        commandManager.unregisterSystemCommand(this._permidCommandId);
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