import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

import currencyAccess from "../../../currency/currency-access";
import currencyManager from "../../../currency/currency-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "rawTopCurrency",
        description: "指定した通貨の使用率が最も高いものを含む生の配列を返します。配列内の項目には 'place'、'username' および 'amount' プロパティが含まれます。",
        usage: "rawTopCurrency[currencyName]",
        possibleDataOutput: [OutputDataType.TEXT]
    },

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    evaluator: async (_, currencyName: string, count: number = 10) => {

        if (currencyName == null) {
            return [];
        }

        // limit to max of 50
        if (count > 50) {
            count = 50;
        } else if (count < 1) {
            // min of 1
            count = 1;
        }

        const currencyData = currencyAccess.getCurrencies();

        if (currencyData == null) {
            return [];
        }

        const currencies = Object.values(currencyData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currency = <{name: string, id: any} | null>currencies.find((c: {name: string, id: unknown}) => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return [];
        }

        const topCurrencyHolders = await currencyManager.getTopCurrencyHolders(currency.id, count);

        const topHoldersDisplay = topCurrencyHolders.map((u, i) => ({
            place: i + 1,
            username: u.username,
            userId: u._id,
            userDisplayName: u.displayName,
            amount: u.currency[currency.id]
        }));

        return topHoldersDisplay;
    }
};

export default model;
