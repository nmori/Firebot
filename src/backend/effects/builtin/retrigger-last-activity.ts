import type { EffectType } from "../../../types";

import { ActivityFeedManager } from "../../events/activity-feed-manager";

const effect: EffectType = {
    definition: {
        id: "firebot:retrigger-last-activity",
        name: "直近アクティビティ再実行",
        description: "ダッシュボードのアクティビティフィードで最新イベントを再実行します",
        icon: "fad fa-redo",
        categories: ["dashboard", "advanced", "scripting"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は、ダッシュボードのアクティビティフィードにある最新のイベントを再実行します。ホットキーや Stream Deck への割り当てに便利です。</p>
            <p><strong>注意:</strong> この演出で再実行されるのは、アクティビティフィードに表示するよう設定されたイベント<em>のみ</em>です。</p>
        </eos-container>
    `,
    onTriggerEvent: () => {
        ActivityFeedManager.retriggerLastActivity();
    }
};

export = effect;