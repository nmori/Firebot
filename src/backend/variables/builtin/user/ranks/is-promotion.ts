import { createEventDataVariable } from "../../../variable-factory";

export default createEventDataVariable({
    handle: "isPromotion",
    description: "視聴者ランク変更イベントの新しいランクが昇格かどうかを返します。",
    events: ["firebot:viewer-rank-updated"],
    type: "bool",
    eventMetaKey: "isPromotion"
});