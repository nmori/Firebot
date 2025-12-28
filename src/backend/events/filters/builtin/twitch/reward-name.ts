import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:reward-name",
    name: "リワード名",
    caseInsensitive: true,
    description: "カスタムチャンネルリワードを名前でフィルタリングします",
    eventMetaKey: "rewardName",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ]
});

export default filter;