import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:bits-badge-tier",
    name: "ビッツバッジのティア",
    description: "解除されたビッツバッジのティア（100、1000、5000 など）でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "bits-badge-unlocked" }
    ],
    eventMetaKey: "badgeTier"
});

export default filter;