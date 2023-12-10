// Migration: done

"use strict";
const quoteManager = require("../../quotes/quotes-manager");
const commandsManager = require("../../chat/commands/CommandManager");
const moment = require("moment");
const logger = require("../../logwrapper");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "quote",
        description: "ランダムな引用文",
        examples: [
            {
                usage: "quote[#]",
                description: "特定の見積もりIDを取得します。"
            }
        ],
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, quoteId) => {
        const quoteCommand = commandsManager.getSystemCommandById("firebot:quotesmanagement");
        const quoteDateFormat = quoteCommand.definition.options.quoteDateFormat.value;
        let quote;
        quoteId = parseInt(quoteId);

        if (quoteId != null && !isNaN(quoteId)) {
            logger.debug("Getting quote " + quoteId + "...");
            quote = await quoteManager.getQuote(quoteId);
        } else {
            logger.debug("Getting random quote...");
            quote = await quoteManager.getRandomQuote();
        }

        if (quote != null) {
            const date = moment(quote.createdAt).format(quoteDateFormat);
            const quoteText = decodeURIComponent(quote.text);
            const quoteString = quoteText + ' - ' + quote.originator + '. [' + quote.game + '] - ' + date;
            logger.debug("Found a quote!");
            return quoteString;
        }

        logger.debug("Couldnt find a quote.");
        return '[見つからない]';
    }
};

module.exports = model;
