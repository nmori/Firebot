import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const expressionish = require('expressionish');
const moment = require("moment");
const twitchApi = require("../../../../twitch-api/api");

const model : ReplaceVariable = {
    definition: {
        handle: "topBitsCheerers",
        description: "その配信者チャンネルで最も多くのビッツを応援したトップユーザのユーザ名を含む JSON 配列を返します。",
        examples: [
            {
                usage: "topBitsCheerers[count]",
                description: "その配信者チャンネルで最も多くのビッツを応援したユーザの、指定されたカウントまでのユーザ名を JSON 配列で返します。"
            },
            {
                usage: "topBitsCheerers[count, period]",
                description: "現在指定されている期間中、配信者チャンネルで最も多くのビッツを応援したユーザの、 指定されたカウントまでのユーザ名を JSON 配列で返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかです。"
            },
            {
                usage: "topBitsCheerers[count, period, startDate]",
                description: "指定した日付に発生した配信者チャンネルで、 指定した期間中に最も多くのビッツを応援したユーザの、 指定したカウントまでのユーザ名を JSON 配列で返します。期間は 'day'、'week'、'month'、'year' あるいは 'all' のいずれかです。"
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    argsCheck: (count: null | number = 1, period: null | string = "all", startDate = null) => {
        if (count == null && period == null && startDate == null) {
            return true;
        }

        period = period ?? "all";

        if (Number.isNaN(count) || count < 1 || count > 100) {
            throw new expressionish.ExpressionArgumentsError("First argument needs to be either null or a number.", 0);
        }

        const validPeriods = ["day", "week", "month", "year", "all"];
        period = period.toLowerCase();

        if (validPeriods.indexOf(period) === -1) {
            throw new expressionish.ExpressionArgumentsError("Second argument must be a valid period ('day', 'week', 'month', 'year', or 'all').", 0);
        }

        if (startDate != null && !moment(startDate).isValid()) {
            throw new expressionish.ExpressionArgumentsError("Third argument must be a valid date string.", 0);
        }

        return true;
    },
    evaluator: async (
        trigger: Trigger,
        count: null | number = 1,
        period: null | string = "all",
        startDate = null
    ) : Promise<unknown[]> => {
        count = count ?? 1;
        period = period ?? "all";
        startDate = startDate == null ? moment() : moment(startDate);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const users = await twitchApi.bits.getChannelBitsTopCheerers(count, period, (<any>startDate).toDate());

        return users;
    }
};

export default model;
