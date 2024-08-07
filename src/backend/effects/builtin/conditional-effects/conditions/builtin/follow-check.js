"use strict";

const userAccess = require("../../../../../common/user-access");
const { ComparisonType } = require("../../../../../../shared/filter-constants");

module.exports = {
    id: "firebot:followcheck",
    name: "フォローチェック",
    description: "カンマで区切られたリスト内のすべてのユーザーをフォローしているかどうかを条件とする。",
    comparisonTypes: [
        ComparisonType.FOLLOW
    ],
    leftSideValueType: "none",
    rightSideValueType: "text",
    predicate: async (conditionSettings, trigger) => {
        const { rightSideValue } = conditionSettings;

        const triggerUsername = trigger.metadata.username;
        const followListString = rightSideValue;

        if (followListString == null) {
            return false;
        }

        const followCheckList = followListString.split(',')
            .filter(f => f != null)
            .map(f => f.toLowerCase().trim());

        const followCheck = await userAccess.userFollowsChannels(triggerUsername, followCheckList);
        return followCheck;
    }
};