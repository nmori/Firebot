import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:bits-badge-tier",
    name: "Bitsバッジティア",
    description: "アンロックされたBitsバッジのティアでフィルタリングします（100、1000、5000など）",
    events: [
        { eventSourceId: "twitch", eventId: "bits-badge-unlocked" }
    ],
    eventMetaKey: "badgeTier"
});

export default filter;