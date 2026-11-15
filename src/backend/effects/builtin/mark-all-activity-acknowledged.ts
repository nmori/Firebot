import type { EffectType } from "../../../types";

import { ActivityFeedManager } from "../../events/activity-feed-manager";

const effect: EffectType = {
    definition: {
        id: "firebot:mark-all-activity-acknowledged",
        name: "全アクティビティ既読化",
        description: "チャットページの全アクティビティを既読にします",
        icon: "fad fa-comment-dots",
        categories: ["common", "dashboard"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container pad-top="true">
            <p>この演出を実行すると、チャットページのアクティビティフィードにあるすべてのアクティビティが確認済みになります。ホットキーや Stream Deck に割り当てて、現在のアクティビティをまとめて確認済みにするのに便利です。</p>
        </eos-container>
    `,
    onTriggerEvent: () => {
        ActivityFeedManager.updateAcknowledgedForAll(true);
        return true;
    }
};

export = effect;