import { createEventDataVariable } from "../../../variable-factory";

export default createEventDataVariable({
    handle: "rankLadder",
    description: "視聴者ランク変更イベントに関連するランクラダーの名前を返します。",
    events: ["firebot:viewer-rank-updated"],
    type: "text",
    eventMetaKey: "rankLadderName"
});