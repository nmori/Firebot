import { EventFilter } from "../../../types/events";
import { ComparisonType } from "../../../shared/filter-constants";
const logger = require("../../logwrapper");

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

const TEXT_COMPARISON_TYPES = [
    ComparisonType.IS,
    ComparisonType.IS_NOT,
    ComparisonType.CONTAINS,
    ComparisonType.MATCHES_REGEX
];

const NUMBER_COMPARISON_TYPES = [
    ComparisonType.IS,
    ComparisonType.IS_NOT,
    ComparisonType.LESS_THAN,
    ComparisonType.LESS_THAN_OR_EQUAL_TO,
    ComparisonType.GREATER_THAN,
    ComparisonType.GREATER_THAN_OR_EQUAL_TO
];


function compareValue(
    comparisonType: ComparisonType,
    expectedValue: unknown,
    actualValue: unknown
): boolean {
    switch (comparisonType) {
        case ComparisonType.IS:
            return actualValue === expectedValue;
        case ComparisonType.IS_NOT:
            return actualValue !== expectedValue;
        case ComparisonType.LESS_THAN:
            return actualValue < expectedValue;
        case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            return actualValue <= expectedValue;
        case ComparisonType.GREATER_THAN:
            return actualValue > expectedValue;
        case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            return actualValue >= expectedValue;
        case ComparisonType.CONTAINS:
            return actualValue?.toString().includes(expectedValue?.toString() ?? "");
        case ComparisonType.MATCHES_REGEX: {
            const regex = new RegExp(expectedValue?.toString() ?? "", "gi");
            return regex.test(actualValue?.toString() ?? "");
        }
        default:
            return false;
    }
}


export function createTextFilter({
    eventMetaKey,
    caseInsensitive,
    ...config
}: FilterConfig): Omit<EventFilter, "presetValues"> {
    return {
        ...config,
        comparisonTypes: TEXT_COMPARISON_TYPES,
        valueType: "text",
        async predicate(filterSettings, eventData) {
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
                case ComparisonType.COMPAT_IS:
                case ComparisonType.COMPAT2_IS:
                case ComparisonType.ORG_IS:
                    return eventValue === filterValue;
                case ComparisonType.IS_NOT:
                case ComparisonType.COMPAT_IS_NOT:
                case ComparisonType.COMPAT2_IS_NOT:
                case ComparisonType.ORG_IS_NOT:
                    return eventValue !== filterValue;
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
                default:
                    logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                    return false;
            }
        }
    };
}

export function createNumberFilter({
    eventMetaKey,
    ...config
}: Omit<FilterConfig, "caseInsensitive">): Omit<EventFilter, "presetValues" | "valueType"> & {
        valueType: "number";
    } {
    return {
        ...config,
        comparisonTypes: NUMBER_COMPARISON_TYPES,
        valueType: "number",
        async predicate(filterSettings, eventData) {
            const { comparisonType, value } = filterSettings;
            const { eventMeta } = eventData;

            const eventValue = eventMeta[eventMetaKey] ?? 0;

            switch (comparisonType) {
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
    ...config
}: Omit<FilterConfig, "caseInsensitive">): Omit<EventFilter, "presetValues"> {
    return {
        ...config,
        comparisonTypes: [...TEXT_COMPARISON_TYPES, ...NUMBER_COMPARISON_TYPES],
        valueType: "text",
        async predicate(filterSettings, eventData) {
            const { comparisonType, value: filterValue } = filterSettings;
            const { eventMeta } = eventData;

            const eventValue = eventMeta[eventMetaKey] ?? "";

            return compareValue(comparisonType, filterValue, eventValue);
        }
    };
}

