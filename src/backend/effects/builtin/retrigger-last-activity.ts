import type { EffectType } from "../../../types/effects";
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
            <p>This effect will retrigger the most recent event in the Dashboard Activity Feed. Useful for hooking up to a Hotkey or a Stream Deck.</p>
            <p><strong>Note:</strong> This effect will <em>only</em> retrigger events that are configured to appear in the Activity Feed.</p>
        </eos-container>
    `,
    onTriggerEvent: () => {
        ActivityFeedManager.retriggerLastActivity();
    }
};

export = effect;