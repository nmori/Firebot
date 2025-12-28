import { validate } from "uuid";
import { SavedChannelReward } from "../../../types/channel-rewards";
import { EffectType } from "../../../types/effects";
import channelRewardsManager from "../../channel-rewards/channel-reward-manager";
import logger from "../../logwrapper";

type StringUpdatable = { update: boolean, newValue: string };
type StatusUpdatable = { update: boolean, newValue: 'toggle' | boolean };

type RewardWithTags = SavedChannelReward & { sortTags: string[] };

type EffectMeta = {
    rewardSettings: {
        name: StringUpdatable;
        description: StringUpdatable;
        cost: StringUpdatable;
        enabled: StatusUpdatable;
        paused: StatusUpdatable;
    };
    rewardSelectMode: "dropdown" | "associated" | "sortTag" | "custom";
    channelRewardId: string;
    customId: string;
    useTag?: boolean;
    sortTagId?: string;
};

function updateRewardEnabledOrPaused(effect: EffectMeta, channelReward: SavedChannelReward) {
    if (effect.rewardSettings.enabled.update) {
        channelReward.twitchData.isEnabled = effect.rewardSettings.enabled.newValue === 'toggle' ?
            !channelReward.twitchData.isEnabled :
            effect.rewardSettings.enabled.newValue === true;
    }
    if (effect.rewardSettings.paused.update) {
        channelReward.twitchData.isPaused = effect.rewardSettings.paused.newValue === 'toggle' ?
            !channelReward.twitchData.isPaused :
            effect.rewardSettings.paused.newValue === true;
    }
}

const effect: EffectType<EffectMeta> = {
    definition: {
        id: "firebot:update-channel-reward",
        name: "チャンネル特典の更新",
        description: "チャンネル特典の設定を更新する",
        icon: "fad fa-gifts",
        categories: ["advanced", "twitch"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <firebot-radios
                options="selectRewardOptions"
                model="effect.rewardSelectMode">
            </firebot-radios>
        </eos-container>

        <eos-container ng-if="effect.rewardSelectMode == 'dropdown'" header="チャンネル特典">
            <firebot-searchable-select
                ng-model="effect.channelRewardId"
                items="manageableRewards"
                placeholder="チャンネル特典を選択または検索..."
            />
        </eos-container>

        <eos-container ng-if="effect.rewardSelectMode == 'sortTag'" header="チャンネル特典タグ">
            <firebot-searchable-select
                ng-model="effect.sortTagId"
                items="sortTags"
                placeholder="タグを選択または検索..."
            />
        </eos-container>

        <eos-container ng-if="effect.rewardSelectMode == 'custom'" header="チャンネル特典の名前/ID">
            <firebot-input placeholder="チャンネル特典の名前/ID" model="effect.customId" menu-position="under" />
            <div class="effect-info alert alert-warning">
                注：FirebotはFirebotで最初に作成されたチャンネル特典のみ更新できます。
            </div>
        </eos-container>

        <eos-container ng-show="showRewardSettings()" header="特典設定" pad-top="true">

            <firebot-checkbox
                label="有効状態を更新"
                model="effect.rewardSettings.enabled.update"
                aria-label="Toggle enabled"
            />
            <div ng-show="effect.rewardSettings.enabled.update" style="margin-bottom: 15px;">
                <div class="btn-group" uib-dropdown>
                    <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                    {{getToggleEnabledDisplay(effect.rewardSettings.enabled.newValue)}} <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                        <li role="menuitem" ng-click="effect.rewardSettings.enabled.newValue = true"><a href>有効</a></li>
                        <li role="menuitem" ng-click="effect.rewardSettings.enabled.newValue = false"><a href>無効</a></li>
                        <li role="menuitem" ng-click="effect.rewardSettings.enabled.newValue = 'toggle'"><a href>切り替え</a></li>
                    </ul>
                </div>
            </div>

            <firebot-checkbox
                label="更新を一時停止する"
                model="effect.rewardSettings.paused.update"
                aria-label="Toggle paused"
            />
            <div ng-show="effect.rewardSettings.paused.update" style="margin-bottom: 15px;">
                <div class="btn-group" uib-dropdown>
                    <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                    {{getTogglePausedDisplay(effect.rewardSettings.paused.newValue)}} <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                        <li role="menuitem" ng-click="effect.rewardSettings.paused.newValue = true"><a href>一時停止</a></li>
                        <li role="menuitem" ng-click="effect.rewardSettings.paused.newValue = false"><a href>停止を解除</a></li>
                        <li role="menuitem" ng-click="effect.rewardSettings.paused.newValue = 'toggle'"><a href>切り替え</a></li>
                    </ul>
                </div>
            </div>

            <div ng-hide="effect.rewardSelectMode === 'sortTag'">
                <firebot-checkbox
                    label="名前を更新"
                    model="effect.rewardSettings.name.update"
                    aria-label="更新名"
                />
                <div ng-show="effect.rewardSettings.name.update" style="margin-bottom: 15px;">
                    <firebot-input model="effect.rewardSettings.name.newValue" placeholder-text="テキストを入力" />
                </div>

                <firebot-checkbox
                    label="説明を更新"
                    model="effect.rewardSettings.description.update"
                    aria-label="更新内容"
                />
                <div ng-show="effect.rewardSettings.description.update" style="margin-bottom: 15px;">
                    <firebot-input model="effect.rewardSettings.description.newValue" use-text-area="true" placeholder-text="テキストを入力" />
                </div>

                <firebot-checkbox
                    label="金額を更新"
                    model="effect.rewardSettings.cost.update"
                    aria-label="新しい価格"
                />
                <div ng-show="effect.rewardSettings.cost.update" style="margin-bottom: 15px;">
                    <firebot-input model="effect.rewardSettings.cost.newValue" placeholder-text="新しい価格を入力" />
                </div>
            </div>

        </eos-container>
    `,
    optionsController: ($scope, channelRewardsService, sortTagsService) => {

        $scope.manageableRewards = channelRewardsService
            .channelRewards.filter(r => r.manageable)
            .map(r => ({ id: r.twitchData.id, name: r.twitchData.title }));

        $scope.sortTags = sortTagsService.getSortTags("channel rewards");

        $scope.hasTags = $scope.sortTags != null && $scope.sortTags.length > 0;

        $scope.selectRewardOptions = {
            dropdown: {
                text: "特典を選択",
                description: "ドロップダウンリストからチャンネル特典を選択"
            },
            associated: {
                text: "関連付けられた特典",
                description: "現在のイベントに関連付けられたチャンネル特典を使用",
                hide: !($scope.trigger === "channel_reward" || $scope.triggerMeta?.triggerId?.startsWith("twitch:channel-reward-redemption"))
            },
            sortTag: {
                text: "ソートタグ",
                description: "指定されたソートタグを持つチャンネル特典を更新",
                hide: !$scope.hasTags
            },
            custom: {
                text: "カスタム",
                description: "チャンネル特典の名前/IDを手動で指定"
            }
        };

        if ($scope.effect.rewardSelectMode == null) {
            // Support legacy bool useTag
            $scope.effect.rewardSelectMode = $scope.effect.useTag ? "sortTag" : "dropdown";
        }

        if (!$scope.hasTags && $scope.effect.rewardSelectMode === "sortTag") {
            $scope.effect.rewardSelectMode = "dropdown";
        }

        $scope.showRewardSettings = () => (
            ($scope.effect.rewardSelectMode === "dropdown" && $scope.effect.channelRewardId != null && $scope.effect.channelRewardId !== "") ||
            ($scope.effect.rewardSelectMode === "sortTag" && $scope.effect.sortTagId != null && $scope.effect.sortTagId !== "") ||
            ($scope.effect.rewardSelectMode === "custom" && $scope.effect.customId != null && $scope.effect.customId !== "") ||
            ($scope.effect.rewardSelectMode === "associated")
        );

        $scope.getToggleEnabledDisplay = (action) => {
            if (action === "toggle") {
                return "切り替え";
            }
            if (action === true) {
                return "有効";
            }
            return "無効";
        };

        $scope.getTogglePausedDisplay = (action) => {
            if (action === "toggle") {
                return "切り替え";
            }
            if (action === true) {
                return "一時停止";
            }
            return "停止を解除";
        };

        if ($scope.effect.rewardSettings == null) {
            $scope.effect.rewardSettings = {
                name: {
                    update: false,
                    newValue: ""
                },
                description: {
                    update: false,
                    newValue: ""
                },
                cost: {
                    update: false,
                    newValue: "1"
                },
                enabled: {
                    update: false,
                    newValue: 'toggle'
                },
                paused: {
                    update: false,
                    newValue: 'toggle'
                }
            };
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (
            effect.rewardSelectMode === null
            || (
                effect.rewardSelectMode === "dropdown" &&
                effect.channelRewardId == null
            ) || (
                effect.rewardSelectMode === "sortTag" &&
                effect.sortTagId == null
            ) || (
                effect.rewardSelectMode === "custom" &&
                effect.customId == null
            )
        ) {
            errors.push("更新するチャンネル特典を指定してください。");
        }

        if (
            (
                effect.rewardSelectMode !== "sortTag" &&
                !effect.rewardSettings.paused.update &&
                !effect.rewardSettings.enabled.update &&
                !effect.rewardSettings.cost.update &&
                !effect.rewardSettings.name.update &&
                !effect.rewardSettings.description.update
            ) ||
            (
                effect.rewardSelectMode === "sortTag" &&
                !effect.rewardSettings.paused.update &&
                !effect.rewardSettings.enabled.update
            )
        ) {
            errors.push("更新するプロパティを少なくとも1つ選択してください。");
        }

        if (effect.rewardSettings.name.update &&
            (effect.rewardSettings.name.newValue == null ||
            effect.rewardSettings.name.newValue === "")
        ) {
            errors.push("特典の新しい名前を指定してください。");
        }

        if (effect.rewardSettings.description.update &&
            (effect.rewardSettings.description.newValue == null ||
            effect.rewardSettings.description.newValue === "")
        ) {
            errors.push("特典の新しい説明を指定してください。");
        }

        if (effect.rewardSettings.cost.update &&
            (effect.rewardSettings.cost.newValue == null ||
            effect.rewardSettings.cost.newValue === "")
        ) {
            errors.push("特典の新しい金額を指定してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, channelRewardsService, sortTagsService) => {
        if (!effect.rewardSettings.paused.update &&
            !effect.rewardSettings.enabled.update &&
            !effect.rewardSettings.cost.update &&
            !effect.rewardSettings.name.update &&
            !effect.rewardSettings.description.update) {
            return "";
        }
        // support legacy bool useTag
        let selectMode = effect.rewardSelectMode;
        selectMode ??= effect.useTag ? "sortTag" : "dropdown";

        let rewardName = "";
        let action = "";

        switch (selectMode) {
            case "dropdown":
                rewardName = channelRewardsService.channelRewards.find(r => r.twitchData.id === effect.channelRewardId)?.twitchData.title ?? "不明な特典";
                break;
            case "associated":
                rewardName = "関連付けられた特典";
                break;
            case "sortTag":
                rewardName = `タグ: ${sortTagsService.getSortTags("channel rewards").find(t => t.id === effect.sortTagId)?.name ?? "不明なタグ"}`;
                break;
            case "custom":
                rewardName = effect.customId;
                break;
        }

        if (effect.rewardSettings.enabled.update && effect.rewardSettings.paused.update) {
            if (effect.rewardSettings.enabled.newValue === "toggle" && effect.rewardSettings.paused.newValue === "toggle") {
                action = "有効と一時停止を切り替え";
            } else {
                const enableAction = effect.rewardSettings.enabled.newValue === "toggle" ? "有効を切り替え" : effect.rewardSettings.enabled.newValue ? "有効" : "無効";
                const pauseAction = effect.rewardSettings.paused.newValue === "toggle" ? "一時停止を切り替え" : effect.rewardSettings.paused.newValue ? "一時停止" : "停止を解除";
                action = `${enableAction}と${pauseAction}`;
            }
        } else if (effect.rewardSettings.enabled.update) {
            action = effect.rewardSettings.enabled.newValue === "toggle" ? "有効を切り替え" : effect.rewardSettings.enabled.newValue ? "有効" : "無効";
        } else if (effect.rewardSettings.paused.update) {
            action = effect.rewardSettings.paused.newValue === "toggle" ? "一時停止を切り替え" : effect.rewardSettings.paused.newValue ? "一時停止" : "停止を解除";
        } else if (effect.rewardSettings.name.update) {
            return `${rewardName}を${effect.rewardSettings.name.newValue}に変更`;
        } else if (effect.rewardSettings.description.update) {
            action = `説明を更新:`;
        } else if (effect.rewardSettings.cost.update) {
            action = `金額を${effect.rewardSettings.cost.newValue}に設定:`;
        }
        return `${action} ${rewardName}`;
    },
    onTriggerEvent: async ({ trigger, effect }) => {
        if (!effect.rewardSettings.paused.update &&
            !effect.rewardSettings.enabled.update &&
            !effect.rewardSettings.cost.update &&
            !effect.rewardSettings.name.update &&
            !effect.rewardSettings.description.update) {
            logger.error("Update Channel Reward: No updates selected. Skipping effect.");
            return false;
        }
        if (!effect.rewardSelectMode) {
            effect.rewardSelectMode = effect.useTag ? "sortTag" : "dropdown";
        }
        if (effect.rewardSelectMode !== "sortTag") {
            if (effect.rewardSettings.name.update && (effect.rewardSettings.name.newValue == null ||
                effect.rewardSettings.name.newValue === "" ||
                effect.rewardSettings.name.newValue.length > 45)) {
                logger.error("Update Channel Reward: Invalid Name.");
                return;
            }

            if (effect.rewardSettings.description.update && (effect.rewardSettings.description.newValue == null ||
                effect.rewardSettings.description.newValue === "" ||
                effect.rewardSettings.description.newValue.length > 200)) {
                logger.error("Update Channel Reward: Invalid Description.");
                return;
            }

            if (effect.rewardSettings.cost.update && (effect.rewardSettings.cost.newValue == null ||
                isNaN(parseInt(effect.rewardSettings.cost.newValue)) ||
                parseInt(effect.rewardSettings.cost.newValue) < 1)) {
                logger.error("Update Channel Reward: Invalid Cost.");
                return;
            }

            let rewardId;
            switch (effect.rewardSelectMode) {
                case "dropdown":
                    rewardId = effect.channelRewardId;
                    break;
                case "associated":
                    rewardId = trigger.metadata.eventData?.rewardId ?? trigger.metadata.rewardId;
                    break;
                case "custom":
                    rewardId = validate(effect.customId)
                        ? effect.customId
                        : channelRewardsManager.getChannelRewardIdByName(effect.customId);
                    break;
            }

            const channelReward = channelRewardsManager.getChannelReward(rewardId);
            if (channelReward == null) {
                logger.error(`Update Channel Reward: Invalid Channel Reward ID: ${rewardId}`);
                return;
            }

            if (effect.rewardSettings.name.update) {
                channelReward.twitchData.title = effect.rewardSettings.name.newValue;
            }
            if (effect.rewardSettings.description.update) {
                channelReward.twitchData.prompt = effect.rewardSettings.description.newValue;
            }
            if (effect.rewardSettings.cost.update) {
                channelReward.twitchData.cost = parseInt(effect.rewardSettings.cost.newValue);
            }
            updateRewardEnabledOrPaused(effect, channelReward);
            await channelRewardsManager.saveChannelReward(channelReward, true);
            return true;
        }

        if (!effect.rewardSettings.enabled.update && !effect.rewardSettings.paused.update) {
            logger.error("Update Channel Reward: Trying to toggle by tag without updating enabled or paused. Skipping.");
            return false;
        }

        const rewards = Object.values(channelRewardsManager.channelRewards as Record<string, RewardWithTags>)
            .filter(reward => reward.sortTags?.includes(effect.sortTagId) && reward.manageable);

        const promises: Promise<SavedChannelReward>[] = [];

        rewards.forEach((channelReward) => {
            updateRewardEnabledOrPaused(effect, channelReward);
            promises.push(channelRewardsManager.saveChannelReward(channelReward, true));
        });

        await Promise.all(promises);
    }
};

export = effect;