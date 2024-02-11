import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const userDatabase = require("../../../database/userDatabase");
const model : ReplaceVariable = {
    definition: {
        handle: "rawTopViewTime",
        description: "視聴時間 (時間単位) が最も長いユーザを含む生の配列を返します。項目には 'username'、'place' および 'minutes' プロパティが含まれます。",
        usage: "rawTopViewTime[count]",
        possibleDataOutput: [OutputDataType.TEXT]
    },

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    evaluator: async (_, count: number = 10) => {

        // min of 1
        if (count < 1) {
            count = 1;
        }

        const topViewTimeUsers = await userDatabase.getTopViewTimeUsers(count);

        return topViewTimeUsers.map((u, i) => ({
            place: i + 1,
            username: u.username,
            minutes: u.minutesInChannel
        }));
    }
};

export default model;
