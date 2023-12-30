// Migration: info - Needs implementation details

"use strict";

const { OutputDataType } = require("../../../shared/variable-constants");

const currencyDatabase = require("../../database/currencyDatabase");

const model = {
    definition: {
        handle: "rawTopCurrency",
        description: "指定した通貨の使用率が最も高いものを含む生の配列を返します。配列内の項目には 'place'、'username' および 'amount' プロパティが含まれます。",
        usage: "rawTopCurrency[currencyName]",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, currencyName, count = 10) => {

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

        const currencyData = currencyDatabase.getCurrencies();

        if (currencyData == null) {
            return [];
        }

        const currencies = Object.values(currencyData);

        const currency = currencies.find(c => c.name.toLowerCase() === currencyName.toLowerCase());

        if (currency == null) {
            return [];
        }

        const topCurrencyHolders = await currencyDatabase.getTopCurrencyHolders(currency.id, count);

        const topHoldersDisplay = topCurrencyHolders.map((u, i) => ({
            place: i + 1,
            username: u.displayName,
            amount: u.currency[currency.id]
        }));

        return topHoldersDisplay;
    }
};

module.exports = model;
