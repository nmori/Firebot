import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:custom-variable-name",
    name: "カスタム変数名",
    description: "カスタム変数名でフィルタ",
    eventMetaKey: ({eventId}) => {
        if (eventId === "custom-variable-set") {
            return "createdCustomVariableName";
        }
        return "expiredCustomVariableName";
    },
    events: [
        { eventSourceId: "firebot", eventId: "custom-variable-set" },
        { eventSourceId: "firebot", eventId: "custom-variable-expired" }
    ]
});

export default filter;