import type { ReplaceVariable } from "../../../../types/variables";

import currencyAccess from "../../../currency/currency-access";
import currencyManager from "../../../currency/currency-manager";
import { commafy } from "../../../utils";

const model : ReplaceVariable = {
    definition: {
        handle: "topCurrency",
        description: "指定した通貨を最も多く使用しているユーザの一覧をカンマ区切りで返します。デフォルトはトップ 10 で、二番目の引数に任意の数値を指定できます。",
        usage: "topCurrency[currencyName]",
        hasSuggestions: true,
        noSuggestionsText: "No currencies have been created yet.",
        possibleDataOutput: ["text"]
    },
    getSuggestions: () => {
        const currencies = Object.values(currencyAccess.getCurrencies());
        return currencies.flatMap(c => ([
            {
                usage: `topCurrency[${c.name}]`,
                description: `Get the top 10 ${c.name} usernames and amounts`
            },
            {
                usage: `topCurrency[${c.name}, 5]`,
                description: `Get the top 5 ${c.name} usernames and amounts`
            }
        ]));
    },

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

        const currencyData = currencyAccess.getCurrencies();

        if (currencyData == null) {
            return "[通貨発行なし]";
        }

        const currencies = Object.values(currencyData);


        const currency = currencies.find((c: { name: string, id: unknown }) => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return "[無効な通貨名]";
        }

        const topCurrencyHolders = await currencyManager.getTopCurrencyHolders(currency.id, count);

        const topHoldersDisplay = topCurrencyHolders.map((u, i) => {
            return `#${i + 1}) ${u.displayName} - ${commafy(u.currency[currency.id])}`;
        }).join(", ");

        return topHoldersDisplay;
    }
};

export default model;