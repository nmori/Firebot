// Migration: info needed
"use strict";
const moment = require("moment");
const logger = require("../../../../backend/logwrapper");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;
const model = {
    definition: {
        handle: "discordTimestamp",
        description: "繧ｿ繧､繝繧ｾ繝ｼ繝ｳ蜀・・蜈ｨ繝ｦ繝ｼ繧ｶ縺ｫ驕ｩ蛻・↑譎ょ綾繧堤､ｺ縺・discord 繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ蜃ｺ蜉帙＠縺ｾ縺吶・,
        usage: "discordTimestamp[]",
        examples: [
            {
                usage: "discordTimestamp[]",
                description: "迴ｾ蝨ｨ譎ょ綾繧剃ｽｿ逕ｨ縺励※Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00]",
                description: "謖・ｮ壹＆繧後◆譎ょ綾繧剃ｽｿ逕ｨ縺励※縲√ョ繝輔か繝ｫ繝医・ discord 繝輔か繝ｼ繝槭ャ繝医〒 discord 繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:t]",
                description: "縲檎洒縺・凾髢薙阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺吶ｋ縲・X・・01:00 | 1:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:T]",
                description: "縲碁聞縺・凾髢薙阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺吶ｋ縲・X・・01:00:00 | 01:00:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:d]",
                description: "縲檎洒縺・律莉倥阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・X・・1/26/2076 | 26/01/2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:D]",
                description: "縲碁聞縺・律莉倥阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・X・・January 26, 2076 | 26 January 2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:f]",
                description: "縲檎洒縺・律譎ゅ阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺吶ｋ縲・X・・January 26, 2076 1:00 PM | 26 January 2076 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:F]",
                description: "縲碁聞縺・律譎ゅ阪・Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺吶ｋ縲・X・・Sunday, January 26, 2076 1:00 PM | Sunday, 26 January 2076, 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:R]",
                description: "逶ｸ蟇ｾ逧・↑Discord縺ｮ繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・X・・'in 53 years' | 'in 23 minutes'"
            },
            {
                usage: "discordTimestamp[13:00:00]",
                description: "迴ｾ蝨ｨ縺ｮ譌･莉倥・謖・ｮ壹＆繧後◆譎る俣繧剃ｽｿ逕ｨ縺励※Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・
            },
            {
                usage: "discordTimestamp[now, R]",
                description: "謖・ｮ壹＆繧後◆繝輔か繝ｼ繝槭ャ繝医〒迴ｾ蝨ｨ縺ｮ譌･莉倥→譎ょ綾繧剃ｽｿ逕ｨ縺励※Discord繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励ｒ菴懈・縺励∪縺吶・
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, dateString, format) => {
        let timestamp = moment().unix();
        const validFormats = [
            't',
            'T',
            'd',
            'D',
            'f*',
            'F',
            'R'
        ];

        // Create dateString using current time if no dateString provided.
        if (dateString == null || dateString === 'now') {
            dateString = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        dateString = dateString.trim();

        // If user only includes time, assume they want that time on the current day.
        if (!dateString.includes('-')) {
            let userDate = new Date();
            const offset = userDate.getTimezoneOffset();
            userDate = new Date(userDate.getTime() - (offset * 60 * 1000));
            userDate = userDate.toISOString().split('T')[0];
            dateString = `${userDate} ${dateString}`;
        }

        // Now, validate dateString format.
        if (!moment(dateString, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            logger.error(`Incorrect date format provided to discord timestamp.`);
            return '[Incorrect date format]';
        }

        // Convert dateString to unix for discord.
        timestamp = moment(dateString, 'YYYY-MM-DD HH:mm:ss').unix();

        // If no format given, use discord default.
        if (format == null || format === '') {
            return `<t:${timestamp}>`;
        }

        format = format.trim();

        // Validate format is a valid discord format. If not, log error and use discord default format.
        if (!validFormats.includes(format)) {
            logger.error(`Incorrect format passed to discord timestamp, using discord defaults.`);
            return `<t:${timestamp}>`;
        }

        // Otherwise, use the given format.
        return `<t:${timestamp}:${format}>`;
    }
};
module.exports = model;
