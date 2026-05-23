"use strict";
(function () {
    angular
        .module("firebotApp")
        .controller("powerUpsAndRewardsController", function (
            $scope,
            $rootScope,
            channelRewardsService,
            powerUpsService,
            utilityService,
            accountAccess,
            settingsService
        ) {
            $scope.channelRewardsService = channelRewardsService;
            $scope.powerUpsService = powerUpsService;

            $scope.activeTab = settingsService.getSetting("DefaultRewardTab");

            $scope.canUseChannelRewards = () => accountAccess.accounts["streamer"].loggedIn
                && (channelRewardsService.userIsEligible);

            // triggering twitch sync for both features
            channelRewardsService.syncChannelRewards();
            powerUpsService.syncPowerUps();

            $scope.saveChannelReward = (reward) => {
                channelRewardsService.saveChannelReward(reward);
            };

            $scope.onRewardsUpdated = (items) => {
                channelRewardsService.saveAllRewards(items);
            };

            $scope.onPowerUpsUpdated = (items) => {
                powerUpsService.saveAllPowerUps(items);
            };

            $scope.openTwitchPowerUpsPage = () => {
                const username = accountAccess.accounts["streamer"].username;
                $rootScope.openLinkExternally(`https://dashboard.twitch.tv/u/${username}/viewer-rewards/channel-points/rewards`);
            };

            $scope.rewardHeaders = [
                {
                    headerStyles: {
                        'width': '50px'
                    },
                    cellTemplate: `
                        <div style="width: 30px; height: 30px; border-radius: 5px; padding: 5px; background-color: {{data.twitchData.backgroundColor}};">
                            <img ng-src="{{data.twitchData.image ? data.twitchData.image.url1x : data.twitchData.defaultImage.url1x}}"  style="width: 100%;filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.50));"/>
                        </div>
                    `,
                    cellController: () => { }
                },
                {
                    name: "NAME",
                    icon: "fa-user",
                    headerStyles: {
                        'min-width': '125px'
                    },
                    dataField: "twitchData.title",
                    sortable: true,
                    cellTemplate: `{{data.twitchData.title}} <i ng-hide="data.manageable" class="fas fa-lock muted" style="font-size: 12px;" uib-tooltip="この報酬は Firebot 外部または旧バージョンで作成されたため、Firebot では設定を変更できません。" />`,
                    cellController: () => { }
                },
                {
                    name: "COST",
                    icon: "fa-coin",
                    dataField: "twitchData.cost",
                    sortable: true,
                    cellTemplate: `{{data.twitchData.cost}}`,
                    cellController: () => { }
                },
                {
                    cellTemplate: `<span class="paused-dot" style="margin-right: 5px" ng-class="{'paused': data.twitchData.isPaused, 'unpaused': !data.twitchData.isPaused}"></span>{{data.twitchData.isPaused ? '一時停止中' : '稼働中' }}`,
                    cellController: () => { }
                }
            ];

            $scope.powerUpHeaders = [
                {
                    headerStyles: {
                        'width': '50px'
                    },
                    cellTemplate: `
                        <div style="width: 30px; height: 30px; border-radius: 5px; padding: 5px; background-color: {{data.twitchData.backgroundColor}};">
                            <img ng-src="{{data.twitchData.image ? data.twitchData.image.url1x : data.twitchData.defaultImage.url1x}}"  style="width: 100%;filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.50));"/>
                        </div>
                    `,
                    cellController: () => { }
                },
                {
                    name: "NAME",
                    icon: "fa-user",
                    headerStyles: {
                        'min-width': '125px'
                    },
                    dataField: "twitchData.title",
                    sortable: true,
                    cellTemplate: `{{data.twitchData.title}}`,
                    cellController: () => { }
                },
                {
                    name: "BITS",
                    icon: "fa-bolt",
                    dataField: "twitchData.bits",
                    sortable: true,
                    cellTemplate: `{{data.twitchData.bits}}`,
                    cellController: () => { }
                }
            ];


            $scope.rewardMenuOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> ${item.manageable ? "編集" : "エフェクトを編集"}</a>`,
                        click: function () {
                            channelRewardsService.showAddOrEditRewardModal(item);
                        }
                    },
                    {
                        html: `<a href uib-tooltip="この報酬は Firebot 外部または旧バージョンで作成されたため、有効状態を変更できません。" tooltip-enable="${!item.manageable}"><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.twitchData.isEnabled ? "チャンネル報酬を無効化" : "チャンネル報酬を有効化"}</a>`,
                        click: function () {
                            item.twitchData.isEnabled = !item.twitchData.isEnabled;
                            channelRewardsService.saveChannelReward(item);
                        },
                        compile: true,
                        enabled: item.manageable
                    },
                    {
                        html: `<a href uib-tooltip="この報酬は Firebot 外部または旧バージョンで作成されたため、一時停止状態を変更できません。" tooltip-enable="${!item.manageable}"><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.twitchData.isPaused ? "チャンネル報酬の一時停止を解除" : "チャンネル報酬を一時停止"}</a>`,
                        click: function () {
                            item.twitchData.isPaused = !item.twitchData.isPaused;
                            channelRewardsService.saveChannelReward(item);
                        },
                        compile: true,
                        enabled: item.manageable
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            channelRewardsService.duplicateChannelReward(item.id);
                        },
                        enabled: channelRewardsService.channelRewards.length < 50
                    },
                    {
                        html: `<a href style="${item.manageable ? 'color: #fb7373;' : ''}" uib-tooltip="この報酬は Firebot 外部または旧バージョンで作成されたため、ここから削除できません。" tooltip-enable="${!item.manageable}"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "チャンネル報酬を削除",
                                    question: `チャンネル報酬 "${item.twitchData.title}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        channelRewardsService.deleteChannelReward(item.id);
                                    }
                                });

                        },
                        compile: true,
                        enabled: item.manageable
                    }
                ];

                return options;
            };

            $scope.powerUpMenuOptions = (item) => {
                return [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> Edit Effects</a>`,
                        click: function () {
                            powerUpsService.showEditPowerUpModal(item);
                        }
                    }
                ];
            };
        });
}());
