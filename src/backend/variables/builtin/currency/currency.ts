import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const currencyDatabase = require("../../../database/currencyDatabase");

const model : ReplaceVariable = {
    definition: {
        handle: "currency",
        description: "指定されたユーザーが、指定された通貨をどれだけ持っているか。",
        usage: "currency[currencyName, username]",
        categories: [VariableCategory.USER, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (_, currencyName, username) => {
        if (currencyName == null || username == null) {
            return 0;
        }

        const currency = currencyDatabase.getCurrencyByName(currencyName);

        if (currency == null) {
            return 0;
        }

        return await currencyDatabase.getUserCurrencyAmount(username, currency.id);
    }
};

export default model;
