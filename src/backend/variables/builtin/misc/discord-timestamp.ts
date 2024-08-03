import { ReplaceVariable } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const moment = require("moment");
const logger = require("../../../../backend/logwrapper");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "discordTimestamp",
        description: "タイムゾーン内の全ユーザに適切な時刻を示す discord タイムスタンプを出力します。",
        usage: "discordTimestamp[]",
        examples: [
            {
                usage: "discordTimestamp[]",
                description: "現在時刻を使用してDiscordタイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00]",
                description: "指定された時刻を使用して、デフォルトの discord フォーマットで discord タイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:t]",
                description: "「短い時間」のDiscordタイムスタンプを作成する。EX： 01:00 | 1:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:T]",
                description: "「長い時間」のDiscordタイムスタンプを作成する。EX： 01:00:00 | 01:00:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:d]",
                description: "「短い日付」のDiscordタイムスタンプを作成します。EX： 1/26/2076 | 26/01/2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:D]",
                description: "「長い日付」のDiscordタイムスタンプを作成します。EX： January 26, 2076 | 26 January 2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:f]",
                description: "「短い日時」のDiscordタイムスタンプを作成する。EX： January 26, 2076 1:00 PM | 26 January 2076 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:F]",
                description: "「長い日時」のDiscordタイムスタンプを作成する。EX： Sunday, January 26, 2076 1:00 PM | Sunday, 26 January 2076, 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:R]",
                description: "相対的なDiscordのタイムスタンプを作成します。EX： 'in 53 years' | 'in 23 minutes'"
            },
            {
                usage: "discordTimestamp[13:00:00]",
                description: "現在の日付の指定された時間を使用してDiscordタイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[now, R]",
                description: "指定されたフォーマットで現在の日付と時刻を使用してDiscordタイムスタンプを作成します。"
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, dateString: string, format: string) => {
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
            dateString = `${userDate.toISOString().split('T')[0]} ${dateString}`;
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
export default model;