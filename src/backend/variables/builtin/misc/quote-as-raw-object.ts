import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";
import type { Quote } from "../../../../types/quotes";

import { QuoteManager } from "../../../quotes/quote-manager";
import commandManager from "../../../chat/commands/command-manager";
import logger from "../../../logwrapper";


const model : ReplaceVariable = {
    definition: {
        handle: "rawQuoteAsObject",
        description: "生のオブジェクトの形でランダムな引用を取得します。",
        examples: [
            {
                usage: "rawQuoteAsObject[#]",
                description: "特定の見積もりIDを取得します。"
            },
            {
                usage: "rawQuoteAsObject[#, property]",
                description: "特定の見積もりの特定のプロパティのみを取得します。有効なプロパティは、id、createdAt、creator、originator、text、gameです。"
            },
            {
                usage: "rawQuoteAsObject[null, property]",
                description: "ランダムな引用の特定のプロパティのみを取得します。有効なプロパティは、id、createdAt、creator、originator、text、gameです。"
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: async (_, quoteId: number, property) => {
        const quoteCommand = commandManager.getSystemCommandById("firebot:quotesmanagement");
        const quoteDateFormat = quoteCommand.definition.options.quoteDateFormat.value as string;
        let quote: Quote;
        quoteId = parseInt(`${quoteId}`);

        if (quoteId != null && !isNaN(quoteId)) {
            logger.debug(`Getting quote ${quoteId}...`);
            quote = await QuoteManager.getQuote(quoteId);
        } else {
            logger.debug("Getting random quote...");
            quote = await QuoteManager.getRandomQuote();
        }

        if (quote != null) {
            logger.debug("Found a quote!");
            const quoteObject = {
                id: quote._id,
                createdAt: moment(quote.createdAt).format(quoteDateFormat),
                creator: quote.creator,
                originator: quote.originator,
                text: quote.text,
                game: quote.game
            };
            if (property != null) {
                if (property !== "id"
                    && property !== "createdAt"
                    && property !== "creator"
                    && property !== "originator"
                    && property !== "text"
                    && property !== "game") {
                    logger.debug("Failed property check for quote: ", property);
                    return "[Invalid Quote Property]";
                }
                return quoteObject[property];
            }

            return quoteObject;
        }

        logger.debug(`Couldn't find a quote.`);
        return '[Cant find quote]';
    }
};

export default model;
