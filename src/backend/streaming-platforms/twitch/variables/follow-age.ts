import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../api";

const model : ReplaceVariable = {
    definition: {
        handle: "followAge",
        usage: "followAge[username]",
        description: "視聴者がチャンネルをフォローしている時間。デフォルトでは日単位。",
        examples: [
            {
                usage: "followAge[$user]",
                description: "関連するユーザー（コマンドをトリガーした人、ボタンを押した人など）がチャンネルをフォローしている時間（日単位）を取得する。."
            },
            {
                usage: "followAge[$target]",
                description: "対象ユーザーがチャンネルをフォローしている期間 (日単位) を取得します。"
            },
            {
                usage: "followAge[username, unitOfTime]",
                description: "指定したユーザ名がそのチャンネルをフォローしている時間を単位時間 (年、月、日、時間、分) で取得します。"
            }
        ],
        categories: ["numbers", "user based"],
        possibleDataOutput: ["number"]
    },
    evaluator: async (
        trigger,
        username: string,
        unitOfTime: moment.unitOfTime.Diff = "days"
    ) => {
        username = username == null ? trigger.metadata.username : username;
        if (username == null) {
            return 0;
        }

        try {
            const followDate = await TwitchApi.users.getFollowDateForUser(username);
            if (followDate == null) {
                return 0;
            }

            const followDateMoment = moment(followDate);
            return moment().diff(followDateMoment, unitOfTime);

        } catch {
            return 0;
        }
    }
};

export default model;