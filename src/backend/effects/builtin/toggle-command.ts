import type { EffectType } from "../../../types/effects";
import { CommandManager } from "../../chat/commands/command-manager";

const effect: EffectType<{
    commandId: string;
    toggleType: "disable" | "enable" | "toggle";
    commandType: "system" | "custom" | "tag";
    sortTagId?: string;
}> = {
    definition: {
        id: "firebot:toggle-command",
        name: "コマンドの切り替え",
        description: "コマンドの有効状態を切り替えます",
        icon: "fad fa-toggle-off",
        categories: ["common", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出を使うと、コマンドの有効状態を自動的に切り替えられます。</p>
        </eos-container>

        <eos-container header="コマンド種別" pad-top="true">
            <dropdown-select options="commandOptions" selected="effect.commandType"></dropdown-select>
        </eos-container>

        <eos-container ng-show="effect.commandType === 'system'" header="システムコマンド" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.commandId"
                items="systemCommands"
                item-name="trigger"
                placeholder="コマンドを選択または検索..."
            />
        </eos-container>

        <eos-container ng-show="effect.commandType === 'custom'" header="カスタムコマンド" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.commandId"
                items="customCommands"
                item-name="trigger"
                placeholder="コマンドを選択または検索..."
            />
        </eos-container>

        <eos-container ng-show="effect.commandType === 'tag'" header="カスタムコマンドタグ" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.sortTagId"
                items="sortTags"
                placeholder="タグを選択または検索..."
            />
        </eos-container>

        <eos-container header="切り替えアクション" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, commandsService, sortTagsService) => {
        $scope.systemCommands = commandsService.getSystemCommands();
        $scope.customCommands = commandsService.getCustomCommands();
        $scope.sortTags = sortTagsService.getSortTags('commands');
        $scope.hasTags = $scope.sortTags != null && $scope.sortTags.length > 0;

        $scope.commandOptions = {
            system: 'システム',
            custom: 'カスタム',
            tag: 'カスタム（タグ指定）'
        };

        if (!$scope.hasTags) {
            delete $scope.commandOptions.tag;
        }

        $scope.toggleOptions = {
            disable: "無効化",
            enable: "有効化",
            toggle: "切り替え"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.commandType !== "tag" && effect.commandId == null) {
            errors.push("コマンドを選択してください。");
        }
        if (effect.commandType === "tag" && effect.sortTagId == null) {
            errors.push("コマンドタグを選択してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect, commandsService, sortTagsService) => {
        const action = effect.toggleType === "toggle" ? "切り替え"
            : effect.toggleType === "enable" ? "有効化" : "無効化";
        if (effect.commandType === "tag") {
            const sortTag = sortTagsService.getSortTags('commands')
                .find(tag => tag.id === effect.sortTagId);
            return `${action} タグ: ${sortTag?.name ?? "不明"}`;
        }
        let command;
        if (effect.commandType === "system") {
            command = commandsService.getSystemCommands()
                .find(cmd => cmd.id === effect.commandId);
        }
        if (effect.commandType === "custom") {
            command = commandsService.getCustomCommands()
                .find(cmd => cmd.id === effect.commandId);
        }
        return `${action} ${command?.trigger ?? "不明なコマンド"}`;
    },
    onTriggerEvent: (event) => {
        const { commandId, commandType, toggleType, sortTagId } = event.effect;

        if (commandType === "system") {
            const systemCommand = CommandManager
                .getAllSystemCommandDefinitions().find(c => c.id === commandId);

            if (systemCommand == null) {
                // command doesnt exist anymore
                return true;
            }

            systemCommand.active = toggleType === "toggle" ? !systemCommand.active : toggleType === "enable";

            CommandManager.saveSystemCommandOverride(systemCommand);
        } else if (commandType === "custom") {
            const customCommand = CommandManager.getCustomCommandById(commandId);

            if (customCommand == null) {
                // command doesn't exist anymore
                return true;
            }

            customCommand.active = toggleType === "toggle" ? !customCommand.active : toggleType === "enable";

            CommandManager.saveCustomCommand(customCommand, "System");
        } else if (commandType === "tag") {
            let commands = CommandManager.getAllCustomCommands();
            commands = commands.filter(c => c.sortTags?.includes(sortTagId));

            commands.forEach((customCommand) => {
                customCommand.active = toggleType === "toggle" ? !customCommand.active : toggleType === "enable";

                CommandManager.saveCustomCommand(customCommand, "System");
            });
        }
    }
};

export = effect;