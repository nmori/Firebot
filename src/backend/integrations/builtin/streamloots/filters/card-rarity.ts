import { createPresetFilter } from "../../../../events/filters/filter-factory";

const filter = createPresetFilter({
    id: "streamloots:card-rarity",
    name: "カードレアリティ",
    description: "引き換えられた StreamLoots カードのレアリティでフィルターします",
    events: [
        { eventSourceId: "streamloots", eventId: "redemption" }
    ],
    eventMetaKey: "cardRarity",
    allowIsNot: true,
    presetValues: async () => {
        return [
            {
                value: "common",
                display: "コモン"
            },
            {
                value: "rare",
                display: "レア"
            },
            {
                value: "epic",
                display: "エピック"
            },
            {
                value: "legendary",
                display: "レジェンダリー"
            }
        ];
    }
});

export = filter;