import type { ReplaceVariable } from "../../../../types";
import { FirebotPronounManager } from "../../../pronouns/pronoun-manager";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "pronouns",
    description: "指定したユーザーの代名詞を返します。取得には https://pr.alejo.io/ を使用します。",
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
        if (!username?.length) {
            username = trigger.metadata.username;
        }

        if (typeof pronounNumber === 'string' || <unknown>pronounNumber instanceof String) {
            pronounNumber = Number(`${pronounNumber}`);
        }

        if (!Number.isFinite(pronounNumber)) {
            logger.warn(`Pronoun index not a number. Using "${fallback}"`);
            return fallback;
        }

        const fallbackParts = (fallback ?? "").split("/");
        let fallbackPart = fallback;
        let type: "subject" | "object" | "both";

        switch (pronounNumber) {
            case 1:
                type = "subject";
                fallbackPart = fallbackParts[0];
                break;

            case 2:
                type = "object";
                fallbackPart = fallbackParts[1] ?? fallbackParts[0];
                break;

            default:
                type = "both";
                break;
        }

        const pronoun = await FirebotPronounManager.getUserFriendlyPronounString(username, fallback, type);

        return !!pronoun?.length
            ? pronoun
            : fallbackPart;
    }
};
export default model;