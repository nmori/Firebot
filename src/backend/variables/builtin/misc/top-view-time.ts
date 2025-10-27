import type { ReplaceVariable } from "../../../../types/variables";

import viewerOnlineStatusManager from "../../../viewers/viewer-online-status-manager";
import { commafy } from "../../../utils";

const model : ReplaceVariable = {
    definition: {
        handle: "topViewTime",
        description: "カンマで区切られた、最も閲覧時間の長いユーザーのリスト（時間単位）。デフォルトはトップ10で、2番目の引数にカスタムの数値を指定できます。",
        usage: "topViewTime[count]",
        possibleDataOutput: ["text"]
    },


    evaluator: async (_, count: number = 10) => {

        // limit to max of 25
        if (count > 25) {
            count = 25;
        } else if (count < 1) {
            // min of 1
            count = 1;
        }

        const topViewTimeUsers = await viewerOnlineStatusManager.getTopViewTimeViewers(count);

        const topViewTimeUsersDisplay = topViewTimeUsers.map((u, i) => {
            const hours = u.minutesInChannel > 59 ? Math.floor(u.minutesInChannel / 60) : 0;
            return `#${i + 1}) ${u.username} - ${commafy(hours)}`;
        }).join(", ");

        return topViewTimeUsersDisplay;
    }
};

export default model;
