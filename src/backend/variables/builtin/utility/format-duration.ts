import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
const SECONDS_IN_YEAR = SECONDS_IN_DAY * 365;

const SUFFIXES = [
    ["yr", "yrs", "year", "years"],
    ["wk", "wks", "week", "weeks"],
    ["day", "days", "day", "days"],
    ["hr", "hrs", "hour", "hours"],
    ["min", "mins", "minute", "minutes"],
    ["sec", "secs", "second", "seconds"]
];

const divide = (nom: number, dom: number) => [Math.trunc(nom / dom), nom % dom];

const model : ReplaceVariable = {
    definition: {
        handle: 'formatDuration',
        description: '入力した秒数を人間が読みやすい時間形式にフォーマットします。',
        usage: 'formatDuration[seconds]',
        examples: [
            {
                usage: 'formatDuration[61, raw]',
                description: '年・週・日・時・分・秒の順に数値を含む配列を返します。'
            }, {
                usage: 'formatDuration[61, long]',
                description: '0 の値を省略した long 形式で返します: 1 minute and 1 second'
            }, {
                usage: 'formatDuration[61, long, true]',
                description: '0 の値を省略した long 形式で返します: 1 minute and 1 second'
            }, {
                usage: 'formatDuration[61, long, false]',
                description: 'すべての値を含む long 形式で返します: 0 years, 0 weeks, 0 days, 0 hours, 1 minute and 1 second'
            }, {
                usage: 'formatDuration[61, colon]',
                description: '先頭の 0 を省略したコロン形式で返します: 1:1'
            }, {
                usage: 'formatDuration[61, colon, true]',
                description: '先頭の 0 を省略したコロン形式で返します: 1:1'
            }, {
                usage: 'formatDuration[61, colon, false]',
                description: 'すべての値を含むコロン形式で返します: 0:0:0:0:1:1'
            }, {
                usage: 'formatDuration[61, colon-alt]',
                description: '先頭の 0 を省略したゼロ埋めコロン形式で返します: 01:01'
            }, {
                usage: 'formatDuration[61, colon-alt, true]',
                description: '先頭の 0 を省略したゼロ埋めコロン形式で返します: 01:01'
            }, {
                usage: 'formatDuration[61, colon-alt, false]',
                description: 'すべての値を含むゼロ埋めコロン形式で返します: 00:00:00:00:01:01'
            }, {
                usage: 'formatDuration[61, short]',
                description: '0 の値を省略した short 形式で返します: 1min 1sec'
            }, {
                usage: 'formatDuration[61, short, true]',
                description: '0 の値を省略した short 形式で返します: 1min 1sec'
            }, {
                usage: 'formatDuration[61, short, false]',
                description: 'すべての値を含む short 形式で返します: 0yrs 0wks 0days 0hrs 1min 1sec'
            }, {
                usage: 'formatDuration[61, short-alt]',
                description: '0 の値を省略したスペース付き short 形式で返します: 1 min 1 sec'
            }, {
                usage: 'formatDuration[61, short-alt, true]',
                description: '0 の値を省略したスペース付き short 形式で返します: 1 min 1 sec'
            }, {
                usage: 'formatDuration[61, short-alt, false]',
                description: 'すべての値を含むスペース付き short 形式で返します: 0 yrs 0 wks 0 days 0 hrs 1 min 1 sec'
            }
        ],
        categories: ["numbers"],
        possibleDataOutput: ["text", "array"]
    },
    evaluator(trigger: Trigger, seconds, format, omit = true) {

        let alt = false;
        format = `${format}`.toLowerCase();
        switch (format) {
            case 'raw':
            case 'colon':
            case 'long':
                break;

            case 'colon-alt':
                alt = true;
                format = 'colon';
                break;

            case 'short-alt':
                alt = true;
                format = 'short';
                break;

            default:
                format = 'short';
        }

        omit = (omit === true || omit === "true");

        seconds = Number(seconds);

        let years: number, weeks: number, days: number, hours: number, minutes: number;
        [years, seconds] = divide(<number>seconds, SECONDS_IN_YEAR);
        [weeks, seconds] = divide(<number>seconds, SECONDS_IN_WEEK);
        [days, seconds] = divide(<number>seconds, SECONDS_IN_DAY);
        [hours, seconds] = divide(<number>seconds, SECONDS_IN_HOUR);
        [minutes, seconds] = divide(<number>seconds, SECONDS_IN_MINUTE);

        if (format === 'raw') {
            return [years, weeks, days, hours, minutes, seconds];
        }

        let blocks = [
            [years, ...SUFFIXES[0]],
            [weeks, ...SUFFIXES[1]],
            [days, ...SUFFIXES[2]],
            [hours, ...SUFFIXES[3]],
            [minutes, ...SUFFIXES[4]],
            [<number>seconds, ...SUFFIXES[5]]
        ];

        // Formats: colon, colon-alt
        if (format === 'colon') {
            if (omit === true) {
                while (blocks.length > 0 && blocks[0][0] === 0) {
                    blocks.shift();
                }
            }
            if (blocks.length === 0) {
                return alt ? '00' : '0';
            }
            return blocks.map(block => (alt ? `${block[0]}`.padStart(2, '0') : `${block[0]}`)).join(':');
        }

        // omit values of 0
        if (omit === true) {
            blocks = blocks.filter(block => block[0] !== 0);
        }

        // Format: long
        if (format === 'long') {
            if (blocks.length === 0) {
                return '0 seconds';
            }
            if (blocks.length === 1) {
                return `${blocks[0][0]} ${blocks[0][0] === 1 ? blocks[0][3] : blocks[0][4]}`;
            }

            return blocks
                .map(block => `${block[0]} ${block[0] === 1 ? block[3] : block[4]}`)
                .reduce((result, block, index) => {
                    if (index === 0) {
                        return block;
                    }
                    if (index === (blocks.length - 1)) {
                        return `${result} and ${block}`;
                    }
                    return `${result}, ${block}`;
                }, '');
        }

        // Format: short, short-alt
        if (blocks.length === 0) {
            return alt ? '0 secs' : '0secs';
        }
        return blocks.map(block => `${block[0]}${alt ? ' ' : ''}${block[0] === 1 ? block[1] : block[2]}`).join(' ');
    }
};


export default model;