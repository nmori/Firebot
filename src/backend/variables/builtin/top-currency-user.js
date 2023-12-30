// Migration: info - Needs implementation details

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const currencyDatabase = require("../../database/currencyDatabase");

const model = {
    definition: {
        handle: "topCurrencyUser",
        description: "特定のポジションのユーザー名または金額を上位通貨で取得する",
        examples: [
            {
                usage: "topCurrencyUser[Points, 1, username]",
                description: "トップポイントユーザー名を取得"
            },
            {
                usage: "topCurrencyUser[Points, 5, amount]",
                description: "5位でトップポイントを獲得"
            }
        ],
        usage: "topCurrencyUser[currencyName, position, username/amount]",
        categories: [VariableCategory.USER, VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: async (_, currencyName, position = 1, usernameOrPosition = "username") => {

        if (currencyName == null) {
            return "[Invalid currency name]";
        }

        const currencyData = currencyDatabase.getCurrencies();

        if (currencyData == null) {
            return "[No currencies created]";
        }

        const currencies = Object.values(currencyData);

        const currency = currencies.find(c => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return "[Invalid currency name]";
        }

        const userAtPosition = await currencyDatabase.getTopCurrencyPosition(currency.id, position || 1);

        if (userAtPosition == null) {
            return "[Can't find user at position]";
        }

        if (usernameOrPosition === "username") {
            return userAtPosition.displayName;
        }
        return userAtPosition.currency[currency.id];
    }
};

module.exports = model;
