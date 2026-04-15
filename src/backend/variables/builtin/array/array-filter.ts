import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const getPropertyAtPath = (subject: unknown, path: string) => {
    if (subject == null) {
        return subject;
    }
    const nodes = path.split(".");
    for (const node of nodes) {
        subject = subject[node];
        if (subject == null) {
            return subject;
        }
    }
    return subject;
};

const fuzzyMatch = (value: unknown, match: unknown) : boolean => {

    // Inputs are exact matches
    if (value === match) {
        return true;
    }

    // Treat NaN inputs as equiv
    if (Number.isNaN(value) || Number.isNaN(match)) {
        return Number.isNaN(value) && Number.isNaN(value);
    }

    const ciValue = typeof value === 'string' ? value.toLowerCase() : value;
    const ciMatch = typeof match === 'string' ? match.toLowerCase() : match;

    // Treat null, empty strings, false, and 'false' as equiv
    const matchIsFalsy = match == null || match === '' || match === false || ciMatch === 'false';
    if (value == null || value === '' || value === false || ciValue === 'false') {
        return matchIsFalsy;
    }
    if (matchIsFalsy) {
        return false;
    }

    // Treat true and 'true' as equiv
    const matchIsTrue = match === true || ciMatch === 'true';
    if (value === true || value === 'true') {
        return matchIsTrue;
    }
    if (matchIsTrue) {
        return false;
    }

    // Only allow numbers and strings beyond this point
    if (
        (typeof value === 'number' || typeof value === 'string') &&
        (typeof match === 'number' || typeof match === 'string')
    ) {
        if (
            (typeof value === 'string' && Number.isNaN(Number(value))) ||
            (typeof match === 'string' && Number.isNaN(Number(match)))
        ) {
            return false;
        }
        return Number(value) === Number(match);
    }

    return false;
};

const model : ReplaceVariable = {
    definition: {
        handle: "arrayFilter",
        description: "フィルタリングされた新しい配列を返します。",
        usage: "arrayFilter[array, matcher, propertyPath, removeMatches]",
        examples: [
            {
                usage: 'arrayFilter["[1,2,3]", 1, null, false]',
                description: "1 以外の要素を除外します（新配列: [1]）"
            },
            {
                usage: 'arrayFilter["[1,2,3]", 1, null, true]',
                description: '1 と等しい要素を除外します（新配列: [2,3]）'
            },
            {
                usage: 'arrayFilter["[{\\"username\\": \\"ebiggz\\"},{\\"username\\": \\"MageEnclave\\"}]", ebiggz, username, true]',
                description: 'username プロパティが "ebiggz" の要素を除外します（新配列: [{\\"username\\": \\"MageEnclave\\"}]）'
            },
            {
                usage: 'arrayFilter[rawArray, 1, null, false]',
                description: "1 以外の要素を除外します。"
            },
            {
                usage: 'arrayFilter[rawArray, 1, null, true]',
                description: '1 と等しい要素を除外します。'
            },
            {
                usage: 'arrayFilter[rawArray, value, key, true]',
                description: 'key プロパティが "value" と等しい要素を除外します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: string | unknown[],
        matcher: string,
        propertyPath: string = null,
        removeMatches: null | boolean | string = false
    ) : Array<unknown> => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return [];
            }
        }

        if (!Array.isArray(subject)) {
            return [];
        }

        if (matcher === undefined || matcher === "") {
            return subject;
        }

        removeMatches = removeMatches === true || removeMatches === 'true';

        if (propertyPath == null || propertyPath === 'null' || propertyPath === "") {
            return subject.filter(removeMatches
                ? value => !fuzzyMatch(value, matcher)
                : value => fuzzyMatch(value, matcher)
            );
        }

        return subject.filter(removeMatches
            ? value => !fuzzyMatch(getPropertyAtPath(value, propertyPath), matcher)
            : value => fuzzyMatch(getPropertyAtPath(value, propertyPath), matcher)
        );
    }
};

export default model;