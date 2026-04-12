// Migration: done

"use strict";
const quoteManager = require("../../quotes/quotes-manager");
const commandsManager = require("../../chat/commands/CommandManager");
const moment = require("moment");
const quoteManager = require("../../../quotes/quotes-manager");
const commandManager = require("../../../chat/commands/command-manager");
const logger = require("../../../../backend/logwrapper");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "quoteAsObject",
        description: "JSON繧ｪ繝悶ず繧ｧ繧ｯ繝医・蠖｢蠑上〒繝ｩ繝ｳ繝繝縺ｪ蠑慕畑繧貞叙蠕励＠縺ｾ縺吶・,
        examples: [
            {
                usage: "quoteAsObject[#]",
                description: "迚ｹ螳壹・隕狗ｩ阪ｂ繧蟹D繧貞叙蠕励＠縺ｾ縺吶・
            },
            {
                usage: "quoteAsObject[#, property]",
                description: "迚ｹ螳壹・隕狗ｩ阪ｂ繧翫・迚ｹ螳壹・繝励Ο繝代ユ繧｣縺ｮ縺ｿ繧貞叙蠕励＠縺ｾ縺吶よ怏蜉ｹ縺ｪ繝励Ο繝代ユ繧｣縺ｯ縲（d縲…reatedAt縲…reator縲｛riginator縲》ext縲“ame縺ｧ縺吶・
            },
            {
                usage: "quoteAsObject[null, property]",
                description: "繝ｩ繝ｳ繝繝縺ｪ蠑慕畑縺ｮ迚ｹ螳壹・繝励Ο繝代ユ繧｣縺ｮ縺ｿ繧貞叙蠕励＠縺ｾ縺吶よ怏蜉ｹ縺ｪ繝励Ο繝代ユ繧｣縺ｯ縲（d縲…reatedAt縲…reator縲｛riginator縲》ext縲“ame縺ｧ縺吶・
            }
        ],
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, quoteId, property) => {
        const quoteCommand = commandsManager.getSystemCommandById("firebot:quotesmanagement");
        const quoteDateFormat = quoteCommand.definition.options.quoteDateFormat.value;
        let quote;
        quoteId = parseInt(quoteId);

        if (quoteId != null && !isNaN(quoteId)) {
            logger.debug(`Getting quote ${quoteId}...`);
            quote = await quoteManager.getQuote(quoteId);
        } else {
            logger.debug("Getting random quote...");
            quote = await quoteManager.getRandomQuote();
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

            return JSON.stringify(quoteObject);
        }

        logger.debug("Couldnt find a quote.");
        return '[Cant find quote]';
    }
};

module.exports = model;
