import { createEventDataVariable } from "../../../variable-factory";

export default createEventDataVariable({
    handle: "isDemotion",
    description: "視聴者ランク変更イベントの新しいランクが降格かどうかを返します。",
    events: ["firebot:viewer-rank-updated"],
    type: "bool",
    eventMetaKey: "isDemotion"
});