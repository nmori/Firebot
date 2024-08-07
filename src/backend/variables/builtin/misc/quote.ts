import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const moment = require("moment");

const quoteManager = require("../../../quotes/quotes-manager");
const commandManager = require("../../../chat/commands/command-manager");
const logger = require("../../../../backend/logwrapper");

const model : ReplaceVariable = {
    definition: {
        handle: "quote",
        description: "ランダム見積もり",
        examples: [
            {
                usage: "quote[#]",
                description: "特定の見積もりIDを取得します。"
            }
        ],
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, quoteId: number) => {
        const quoteCommand = commandManager.getSystemCommandById("firebot:quotesmanagement");
        const quoteDateFormat = quoteCommand.definition.options.quoteDateFormat.value;
        let quote;
        quoteId = parseInt(`${quoteId}`);

        if (quoteId != null && !isNaN(quoteId)) {
            logger.debug(`Getting quote ${quoteId}...`);
            quote = await quoteManager.getQuote(quoteId);
        } else {
            logger.debug("Getting random quote...");
            quote = await quoteManager.getRandomQuote();
        }

        if (quote != null) {
            const date = moment(quote.createdAt).format(quoteDateFormat);
            const quoteText = decodeURIComponent(quote.text);
            const quoteString = `${quoteText} - ${quote.originator}. [${quote.game}] - ${date}`;
            logger.debug("Found a quote!");
            return quoteString;
        }

        logger.debug(`Couldn't find a quote.`);
        return '[Cant find quote]';
    }
};

export default model;