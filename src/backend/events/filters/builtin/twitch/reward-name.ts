import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:reward-name",
    name: "報酬名",
    caseInsensitive: true,
    description: "カスタムチャンネル報酬名でフィルタ",
    eventMetaKey: "rewardName",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ]
});

export default filter;