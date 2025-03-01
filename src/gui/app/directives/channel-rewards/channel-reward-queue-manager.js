"use strict";
(function () {
    angular
        .module('firebotApp')
        .component("channelRewardQueueManager", {
            bindings: {},
            template: `
            <div class="queue-manager-container">
                <div
                    ng-if="channelRewardsService.loadingRedemptions"
                    class="queue-loader-overlay">
                    <div>読み込み中...</div>
                </div>
                <div class="queue-manager-content">
                    <div class="queue-rewards-column">
                        <queue-reward-wrapper
                            selected="selectedReward == null"
                            ng-click="setSelectedReward(null)"
                        >
                            <span>すべて ({{totalRedemptionsCount()}})</span>
                        </queue-reward-wrapper>
                        <queue-reward-item
                            ng-repeat="(rewardId, redemptions) in channelRewardsService.redemptions | hideEmptyRewardQueues track by rewardId"
                            reward-id="{{rewardId}}"
                            redemption-count="redemptions.length"
                            selected="selectedReward == rewardId"
                            ng-click="setSelectedReward(rewardId)"
                        >
                        </queue-reward-item>
                    </div>
                    <div class="queue-redemptions-column">
                       <div class="queue-redemptions-list">
                        <queue-redemption-item
                            ng-repeat="redemption in getRedemptions() | orderBy: 'redemptionDate':true track by redemption.id"
                            redemption="redemption"
                            show-reward-name="selectedReward == null"
                        />
                       </div>
                       <div class="queue-footer">
                          <firebot-button
                                text="すべて許可"
                                size="small"
                                icon="fa-check"
                                ng-click="approveOrRejectAll(true)"
                                loading="isLoading"
                                disabled="isLoading || !hasRedemptions()"
                            />
                            <firebot-button
                                text="すべて却下"
                                type="danger"
                                size="small"
                                icon="fa-times"
                                ng-click="approveOrRejectAll(false)"
                                loading="isLoading"
                                disabled="isLoading || !hasRedemptions()"
                            />
                       </div>
                    </div>
                </div>
            </div>
            `,
            controller: function ($scope, channelRewardsService, utilityService) {
                $scope.channelRewardsService = channelRewardsService;

                $scope.selectedReward = null;

                $scope.setSelectedReward = (rewardId) => {
                    $scope.selectedReward = rewardId;
                };

                $scope.getRedemptions = () => {
                    if ($scope.selectedReward == null) {
                        return Object.values(channelRewardsService.redemptions).flat();
                    }
                    return channelRewardsService.redemptions[$scope.selectedReward] || [];
                };

                $scope.hasRedemptions = () => $scope.getRedemptions().length > 0;

                $scope.totalRedemptionsCount = () => Object.values(channelRewardsService.redemptions).reduce((acc, redemptions) => acc + redemptions.length, 0);

                $scope.approveOrRejectAll = (approve = false) => {
                    utilityService
                        .showConfirmationModal({
                            title: approve ? "すべてを許可" : "すべてを却下",
                            question: `すべてのリクエストを ${approve ? "許可" : "却下"} しますか?`,
                            confirmLabel: approve ? "すべて許可" : "却下",
                            confirmBtnType: approve ? "btn-info" : "btn-danger"
                        })
                        .then((confirmed) => {
                            if (confirmed) {
                                $scope.isLoading = true;
                                channelRewardsService.approveOrRejectAllRedemptionsForChannelRewards(
                                    $scope.selectedReward == null ? channelRewardsService.getRewardIdsWithRedemptions() : [$scope.selectedReward],
                                    approve
                                ).then(() => {
                                    $scope.isLoading = false;
                                });
                            }
                        });
                };
            }
        });
}());
