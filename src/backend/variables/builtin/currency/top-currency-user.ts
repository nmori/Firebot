import type { ReplaceVariable } from "../../../../types/variables";

import currencyAccess from "../../../currency/currency-access";
import currencyManager from "../../../currency/currency-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "topCurrencyUser",
        description: "特定のポジションのユーザー名または金額を上位通貨で取得する",
        usage: "topCurrencyUser[currencyName, position, username/amount]",
        categories: ["user based", "advanced"],
        possibleDataOutput: ["text", "number"]
    },
    getSuggestions: async () => {
        const currencies = Object.values(currencyAccess.getCurrencies());
        return currencies.flatMap(c => ([
            {
                usage: `topCurrencyUser[${c.name}, 1, username]`,
                description: "トップポイントユーザー名を取得"
            },
            {
                usage: `topCurrencyUser[${c.name}, 5, amount]`,
                description: "5位でトップポイントを獲得"
            }
        ]));
    },

    evaluator: async (_, currencyName: string, position: number = 1, usernameOrPosition = "username") => {

        if (currencyName == null) {
            return "[Invalid currency name]";
        }

        const currencyData = currencyAccess.getCurrencies();

        if (currencyData == null) {
            return "[No currencies created]";
        }

        const currencies = Object.values(currencyData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currency = <{name: string, id: any} | null>currencies.find((c: {name: string, id: unknown}) => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return "[Invalid currency name]";
        }

        const userAtPosition = await currencyManager.getTopCurrencyPosition(currency.id, position || 1);

        if (userAtPosition == null) {
            return "[Can't find user at position]";
        }

        if (usernameOrPosition === "username") {
            return userAtPosition.displayName;
        }
        return userAtPosition.currency[currency.id];
    }
};

export default model;