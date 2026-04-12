import { ReplaceVariable } from "../../../../../../types/variables";
import { EffectTrigger } from "../../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = [
    "twitch:chat-message",
    "twitch:chat-message-deleted",
    "twitch:first-time-chat",
    "twitch:announcement",
    "twitch:viewer-arrived"
];

const model : ReplaceVariable = {
    definition: {
        handle: "isSharedChatMessage",
        description: "チャットメッセージが共有チャットセッション中に別のチャネルで送信された場合は'true'、そうでない場合は'false'。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.BOOLEAN]
    },
    evaluator: (trigger) => {
        if (trigger.metadata.chatMessage) {
            return trigger.metadata.chatMessage.isSharedChatMessage;
        }
        return trigger.metadata.eventData?.chatMessage?.isSharedChatMessage ?? false;
    }
};

export default model;