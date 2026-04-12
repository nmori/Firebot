import { EventFilter } from "../../../types/events";
import { ComparisonType } from "../../../shared/filter-constants";
<<<<<<< HEAD
=======
import { extractPropertyWithPath } from "../../utility";
const logger = require("../../logwrapper");

type EventData = {
    eventSourceId: string;
    eventId: string;
    eventMeta: Record<string, unknown>;
}

type FilterEvent = Omit<EventData, "eventMeta">;
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20

type FilterConfig = {
    id: string;
    name: string;
    description: string;
    events: Array<{
        eventSourceId: string;
        eventId: string;
    }>;
    eventMetaKey: string;
    caseInsensitive?: boolean;
};

export function createTextFilter({
    eventMetaKey,
    caseInsensitive,
    ...config
}: FilterConfig): Omit<EventFilter, "presetValues"> {
    return {
        ...config,
        comparisonTypes: [
            ComparisonType.IS,
            ComparisonType.IS_NOT,
            ComparisonType.CONTAINS,
            ComparisonType.MATCHES_REGEX
        ],
        valueType: "text",
        predicate(filterSettings, eventData) {
            const { comparisonType, value } = filterSettings;
            const { eventMeta } = eventData;

            let eventValue = eventMeta[eventMetaKey] ?? "";
            if (caseInsensitive) {
                eventValue = eventValue.toString().toLowerCase();
            }
            const filterValue =
        (caseInsensitive ? value?.toLowerCase() : value) ?? "";

            switch (comparisonType) {
                case ComparisonType.IS:
<<<<<<< HEAD
                    return eventValue === filterValue;
                case ComparisonType.IS_NOT:
                    return eventValue !== filterValue;
                case ComparisonType.CONTAINS:
                    return eventValue.includes(filterValue);
                case ComparisonType.MATCHES_REGEX: {
                    const regex = new RegExp(filterValue, "gi");
                    return regex.test(eventValue);
                }
                default:
=======
                case ComparisonType.COMPAT_IS:
                case ComparisonType.COMPAT2_IS:
                case ComparisonType.ORG_IS:
                    return eventValue === filterValue;
                case ComparisonType.IS_NOT:
                case ComparisonType.COMPAT_IS_NOT:
                case ComparisonType.COMPAT2_IS_NOT:
                case ComparisonType.ORG_IS_NOT:
                    return eventValue !== filterValue;
                case ComparisonType.DOESNT_CONTAIN:
                case ComparisonType.COMPAT_DOESNT_CONTAIN:
                case ComparisonType.COMPAT2_DOESNT_CONTAIN:
                case ComparisonType.ORG_DOESNT_CONTAIN:
                    return !eventValue.includes(filterValue);
                case ComparisonType.STARTS_WITH:
                case ComparisonType.ORG_STARTS_WITH:
                    return eventValue.startsWith(filterValue);
                case ComparisonType.DOESNT_STARTS_WITH:
                case ComparisonType.COMPAT_DOESNT_STARTS_WITH:
                case ComparisonType.ORG_DOESNT_STARTS_WITH:
                    return !eventValue.startsWith(filterValue);
                case ComparisonType.ENDS_WITH:
                case ComparisonType.ORG_ENDS_WITH:
                    return eventValue.endsWith(filterValue);
                case ComparisonType.DOESNT_END_WITH:
                case ComparisonType.ORG_DOESNT_END_WITH:
                    return !eventValue.endsWith(filterValue);
                case ComparisonType.CONTAINS:
                case ComparisonType.COMPAT_CONTAINS:
                case ComparisonType.COMPAT2_CONTAINS:
                case ComparisonType.ORG_CONTAINS:
                    return eventValue.includes(filterValue);
                case ComparisonType.MATCHES_REGEX:
                case ComparisonType.COMPAT_MATCHES_REGEX:
                case ComparisonType.COMPAT2_MATCHES_REGEX:
                case ComparisonType.ORG_MATCHES_REGEX: {
                    const regex = new RegExp(filterValue, "gi");
                    return regex.test(eventValue);
                }
                case ComparisonType.DOESNT_MATCH_REGEX:
                case ComparisonType.COMPAT_DOESNT_MATCH_REGEX:
                case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX:
                case ComparisonType.ORG_DOESNT_MATCH_REGEX: {
                    const regex = new RegExp(filterValue, "gi");
                    return !regex.test(eventValue);
                }
                case ComparisonType.MATCHES_REGEX_CS:
                case ComparisonType.COMPAT2_MATCHES_REGEX_CS:
                case ComparisonType.ORG_MATCHES_REGEX_CS: {
                    const regex = new RegExp(filterValue, "g");
                    return regex.test(eventValue);
                }
                case ComparisonType.DOESNT_MATCH_REGEX_CS:
                case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX_CS:
                case ComparisonType.ORG_DOESNT_MATCH_REGEX_CS: {
                    const regex = new RegExp(filterValue, "g");
                    return !regex.test(eventValue);
                }
                default:
                    logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                    return false;
            }
        }
    };
}

export function createNumberFilter({
    eventMetaKey,
    caseInsensitive,
    ...config
}: FilterConfig): Omit<EventFilter, "presetValues" | "valueType"> & {
        valueType: "number";
    } {
    return {
        ...config,
        comparisonTypes: [
            ComparisonType.IS,
            ComparisonType.IS_NOT,
            ComparisonType.LESS_THAN,
            ComparisonType.LESS_THAN_OR_EQUAL_TO,
            ComparisonType.GREATER_THAN,
            ComparisonType.GREATER_THAN_OR_EQUAL_TO
        ],
        valueType: "number",
        async predicate(filterSettings, eventData) {
            const { comparisonType, value } = filterSettings;
            const { eventMeta } = eventData;

            const eventValue = eventMeta[eventMetaKey] ?? 0;

            switch (comparisonType) {
<<<<<<< HEAD
                case ComparisonType.IS: {
                    return eventValue === value;
                }
                case ComparisonType.IS_NOT: {
                    return eventValue !== value;
                }
                case ComparisonType.LESS_THAN: {
                    return eventValue < value;
                }
                case ComparisonType.LESS_THAN_OR_EQUAL_TO: {
                    return eventValue <= value;
                }
                case ComparisonType.GREATER_THAN: {
                    return eventValue > value;
                }
                case ComparisonType.GREATER_THAN_OR_EQUAL_TO: {
                    return eventValue >= value;
                }
                default:
                    return false;
=======
                case ComparisonType.IS:
                case ComparisonType.COMPAT_IS:
                case ComparisonType.COMPAT2_IS:
                case ComparisonType.ORG_IS:
                {
                    return eventValue === value;
                }
                case ComparisonType.IS_NOT:
                case ComparisonType.COMPAT_IS_NOT:
                case ComparisonType.COMPAT2_IS_NOT:
                case ComparisonType.ORG_IS_NOT:
                {
                    return eventValue !== value;
                }
                case ComparisonType.LESS_THAN:
                case ComparisonType.ORG_LESS_THAN:
                {
                    return eventValue < value;
                }
                case ComparisonType.LESS_THAN_OR_EQUAL_TO:
                case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
                {
                    return eventValue <= value;
                }
                case ComparisonType.GREATER_THAN:
                case ComparisonType.COMPAT_GREATER_THAN:
                case ComparisonType.ORG_GREATER_THAN:
                {
                    return eventValue > value;
                }
                case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
                case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
                {
                    return eventValue >= value;
                }
                default:
                    logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                    return false;
            }
        }
    };
}

export function createTextOrNumberFilter({
    eventMetaKey,
    caseInsensitive,
    ...config
}: Omit<FilterConfig, "presetValues" | "allowIsNot">): Omit<EventFilter, "presetValues"> {
    return {
        ...config,
        comparisonTypes: NUMBER_TEXT_COMPARISON_TYPES,
        valueType: "text",
        async predicate(filterSettings, eventData) {
            const { comparisonType, value } = filterSettings;
            const { eventMeta } = eventData;

            let eventValue = extractPropertyWithPath(eventMeta, getMetaKey(eventMetaKey, eventData, filterSettings)) ?? "";
            if (caseInsensitive) {
                eventValue = eventValue.toString().toLowerCase();
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
            }
        }
    };
}
