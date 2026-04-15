import { createEventDataVariable } from "../../../variable-factory";

export default createEventDataVariable({
    handle: "previousRank",
    description: "視聴者ランク変更イベントにおける以前のランクの名前を返します。",
    events: ["firebot:viewer-rank-updated"],
    type: "text",
    eventMetaKey: "previousRankName"
});