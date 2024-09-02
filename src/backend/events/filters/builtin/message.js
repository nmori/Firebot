"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../backend/logwrapper");

module.exports = {
    id: "firebot:message-text",
    name: "チャットメッセージ",
    description: "チャットメッセージでフィルタする",
    events: [
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "announcement" }
    ],
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.CONTAINS,
        ComparisonType.DOESNT_CONTAIN,
        ComparisonType.STARTS_WITH,
        ComparisonType.DOESNT_STARTS_WITH,
        ComparisonType.ENDS_WITH,
        ComparisonType.DOESNT_END_WITH,
        ComparisonType.MATCHES_REGEX_CS,
        ComparisonType.DOESNT_MATCH_REGEX_CS,
        ComparisonType.MATCHES_REGEX,
        ComparisonType.DOESNT_MATCH_REGEX
    ],
    valueType: "text",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        /**
         * @type {string}
         */
        const chatMessage = eventMeta.messageText || "";

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return chatMessage === value;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return chatMessage !== value;
            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.COMPAT2_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return chatMessage.includes(value);
            case ComparisonType.DOESNT_CONTAIN:
            case ComparisonType.COMPAT_DOESNT_CONTAIN:
            case ComparisonType.COMPAT2_DOESNT_CONTAIN:
            case ComparisonType.ORG_DOESNT_CONTAIN:
                return !chatMessage.includes(value);
            case ComparisonType.STARTS_WITH:
            case ComparisonType.ORG_STARTS_WITH:
                return chatMessage.startsWith(value);
            case ComparisonType.DOESNT_STARTS_WITH:
            case ComparisonType.ORG_DOESNT_STARTS_WITH:
                return !chatMessage.startsWith(value);
            case ComparisonType.ENDS_WITH:
            case ComparisonType.ORG_ENDS_WITH:
                return chatMessage.endsWith(value);
            case ComparisonType.DOESNT_END_WITH:
            case ComparisonType.ORG_DOESNT_END_WITH:
                return !chatMessage.endsWith(value);
            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.COMPAT_MATCHES_REGEX:
            case ComparisonType.COMPAT2_MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(value, "gi");
                return regex.test(chatMessage);
            }
            case ComparisonType.DOESNT_MATCH_REGEX:
            case ComparisonType.COMPAT_DOESNT_MATCH_REGEX:
            case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX:
            case ComparisonType.ORG_DOESNT_MATCH_REGEX:
            {
                const regex = new RegExp(value, "gi");
                return !regex.test(chatMessage);
            }
            case ComparisonType.MATCHES_REGEX_CS:
            case ComparisonType.COMPAT2_MATCHES_REGEX_CS:
            case ComparisonType.ORG_MATCHES_REGEX_CS:
            {
                const regex = new RegExp(value, "g");
                return regex.test(chatMessage);
            }
            case ComparisonType.DOESNT_MATCH_REGEX_CS:
            case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX_CS:
            case ComparisonType.ORG_DOESNT_MATCH_REGEX_CS:
            {
                const regex = new RegExp(value, "g");
                return !regex.test(chatMessage);
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};