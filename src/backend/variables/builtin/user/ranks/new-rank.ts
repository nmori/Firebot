import { createEventDataVariable } from "../../../variable-factory";

export default createEventDataVariable({
    handle: "newRank",
    description: "視聴者ランク変更イベントにおける新しいランクの名前を返します。",
    events: ["firebot:viewer-rank-updated"],
    type: "text",
    eventMetaKey: "newRankName"
});