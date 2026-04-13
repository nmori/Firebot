import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:previous-rank",
    name: "前のランク",
    description: "指定した前のランクでフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "viewer-rank-updated" }
    ],
    eventMetaKey: "previousRankId",
    allowIsNot: true,
    presetValues: async (viewerRanksService: any) => viewerRanksService
        .rankLadders
        .flatMap(l => l
            .ranks
            .map(r => ({ value: r.id, display: `${r.name} (${l.name})` }))
        ),
    valueIsStillValid: async (filterSettings, viewerRanksService: any) => viewerRanksService
        .rankLadders
        .find(l => l.ranks?.some(r => r.id === filterSettings.value)) != null,
    getSelectedValueDisplay: (filterSettings, viewerRanksService: any) => {
        const ladderWithRank = viewerRanksService
            .rankLadders
            .find(l => l.ranks?.some(r => r.id === filterSettings.value));

        const rank = ladderWithRank?.ranks?.find(r => r.id === filterSettings.value);

        return rank ? `${rank?.name} (${ladderWithRank?.name})` : "未設定";
    }
});

export default filter;