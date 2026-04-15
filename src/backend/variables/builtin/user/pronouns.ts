import { app } from "electron";

import type { ReplaceVariable } from "../../../../types/variables";

import logger from "../../../logwrapper";

const callUrl = async (url: string): Promise<Response> => {
    try {
        const appVersion = app.getVersion();
        const response = await fetch(url, {
            headers: {
                "User-Agent": `Firebot/${appVersion}`
            }
        });

        if (response) {
            return response;
        }
    } catch (error) {
        logger.warn(`error calling readApi url: ${url}`, (error as Error).message);
        return null;
    }
};

const model : ReplaceVariable = {
    definition: {
        handle: "pronouns",
        description: "指定したユーザーの使用代名詞を返します。https://pronouns.alejo.io/ を使用します。",
        examples: [
            {
                usage: 'pronouns[username, 0, they/them]',
                description: "she/her が設定されていれば 'she/her' を、なければ they/them を返します。"
            },
            {
                usage: 'pronouns[username, 1, they]',
                description: "she/her セットの 1番目プロノウン（she）を返します。なければ they を返します。"
            },
            {
                usage: 'pronouns[username, 2, them]',
                description: "she/her セットの 2番目プロノウン（her）を返します。なければ them を返します。"
            }
        ],
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (
        trigger,
        username: string,
        pronounNumber: number | string = 0,

        fallback : string = "they/them"
    ) => {

        if (typeof pronounNumber === 'string' || <unknown>pronounNumber instanceof String) {
            pronounNumber = Number(`${pronounNumber}`);
        }

        if (!Number.isFinite(pronounNumber)) {
            logger.warn(`Pronoun index not a number using ${fallback}`);
            return fallback;
        }
        try {
            const pronouns = await (await callUrl('https://pronouns.alejo.io/api/pronouns')).json();
            let userPronounData = (await (await callUrl(`https://pronouns.alejo.io/api/users/${username}`)).json())[0];

            let pronounArray = [];
            if (userPronounData == null || userPronounData === undefined) {
                userPronounData = { "pronoun_id": `${fallback}`.replace("/", "") };
            }

            let pronoun = pronouns.find(p => p.name === userPronounData.pronoun_id);
            if (pronoun != null) {
                pronounArray = pronoun.display.split('/');
            } else {
                pronoun = { "display": `${fallback}` };
                pronounArray = fallback.split('/');
            }

            if (pronounNumber === 0) {
                return pronoun.display;
            }

            if (pronounArray.length === 1) {
                return pronounArray[0];
            }

            if (pronounArray.length >= pronounNumber) {
                return pronounArray[pronounNumber - 1];
            }

        } catch (err) {
            logger.warn("error when parsing pronoun api", err);
            return fallback;
        }
        return fallback;
    }
};
export default model;