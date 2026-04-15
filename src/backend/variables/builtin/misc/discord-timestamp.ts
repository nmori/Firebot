import moment from "moment";
import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";
import logger from "../../../logwrapper";

const triggers: TriggersObject = {};
triggers["command"] = true;
triggers["event"] = true;
triggers["manual"] = true;
triggers["custom_script"] = true;
triggers["preset"] = true;
triggers["channel_reward"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "discordTimestamp",
        description: "各ユーザーのタイムゾーンに合わせた時刻を表示する Discord タイムスタンプを出力します。",
        usage: "discordTimestamp[]",
        examples: [
            {
                usage: "discordTimestamp[]",
                description: "現在の時刻で Discord タイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00]",
                description: "指定時刻でデフォルト形式の Discord タイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:t]",
                description: "短時間形式のタイムスタンプ。例: 01:00 | 1:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:T]",
                description: "長時間形式のタイムスタンプ。例: 01:00:00 | 01:00:00 PM"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:d]",
                description: "短日付形式のタイムスタンプ。例: 1/26/2076 | 26/01/2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:D]",
                description: "長日付形式のタイムスタンプ。例: January 26, 2076 | 26 January 2076"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:f]",
                description: "短日時形式のタイムスタンプ。例: January 26, 2076 1:00 PM | 26 January 2076 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:F]",
                description: "長日時形式のタイムスタンプ。例: Sunday, January 26, 2076 1:00 PM | Sunday, 26 January 2076, 13:00"
            },
            {
                usage: "discordTimestamp[2076-01-26 13:00:00:R]",
                description: "相対形式のタイムスタンプ。例: 'in 53 years' | 'in 23 minutes'"
            },
            {
                usage: "discordTimestamp[13:00:00]",
                description: "当日の指定時刻で Discord タイムスタンプを作成します。"
            },
            {
                usage: "discordTimestamp[now, R]",
                description: "指定形式で現在日時の Discord タイムスタンプを作成します。"
            }
        ],
        triggers: triggers,
        categories: ["text"],
        possibleDataOutput: ["text"]
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