import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const currencyDatabase = require("../../../database/currencyDatabase");
const util = require("../../../utility");

const model : ReplaceVariable = {
    definition: {
        handle: "topCurrency",
        description: "指定した通貨を最も多く使用しているユーザの一覧をカンマ区切りで返します。デフォルトはトップ 10 で、二番目の引数に任意の数値を指定できます。",
        usage: "topCurrency[currencyName]",
        possibleDataOutput: [OutputDataType.TEXT]
    },

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    evaluator: async (_, currencyName: string, count: number = 10) => {

        if (currencyName == null) {
            return "[無効な通貨名]";
        }

        // limit to max of 50
        if (count > 50) {
            count = 50;
        } else if (count < 1) {
            // min of 1
            count = 1;
        }

        const currencyData = currencyDatabase.getCurrencies();

        if (currencyData == null) {
            return "[通貨発行なし]";
        }

        const currencies = Object.values(currencyData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currency = <{name: string, id: any} | null>currencies.find((c: {name: string, id: unknown}) => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return "[無効な通貨名]";
        }

        const topCurrencyHolders = await currencyDatabase.getTopCurrencyHolders(currency.id, count);

        const topHoldersDisplay = topCurrencyHolders.map((u, i) => {
            return `#${i + 1}) ${u.displayName} - ${util.commafy(u.currency[currency.id])}`;
        }).join(", ");

        return topHoldersDisplay;
    }
};

export default model;