import moment from "moment";

import type { ReplaceVariable } from "../../../../types/variables";
import type { Quote } from "../../../../types/quotes";

import { CommandManager } from "../../../chat/commands/command-manager";
import { QuoteManager } from "../../../quotes/quote-manager";
import logger from "../../../logwrapper";


const model : ReplaceVariable = {
    definition: {
        handle: "rawQuoteAsObject",
        description: "(非推奨: $quoteAsObject を使用してください) ランダムな引用文を生オブジェクトとして取得します。",
        examples: [
            {
                usage: "rawQuoteAsObject[#]",
                description: "指定した ID の引用文を取得します。"
            },
            {
                usage: "rawQuoteAsObject[#, property]",
                description: "指定した引用文の特定のプロパティのみを取得します。指定できるプロパティは id, createdAt, creator, originator, text, game です。"
            },
            {
                usage: "rawQuoteAsObject[null, property]",
                description: "ランダムな引用文の特定のプロパティのみを取得します。指定できるプロパティは id, createdAt, creator, originator, text, game です。"
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: async (_, quoteId: number, property) => {
        const quoteCommand = CommandManager.getSystemCommandById("firebot:quotesmanagement");
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
