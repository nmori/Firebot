import { ReplaceVariable } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["streamlabs:donation", "streamlabs:eldonation", "tipeeestream:donation", "streamelements:donation", "extralife:donation"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "donationAmountFormatted",
        description: "StreamElements/StreamLabs/Tipeee/ExtraLifeからの寄付金額(通貨記号付き)",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const formattedDonationAmount = (trigger.metadata.eventData && trigger.metadata.eventData.formattedDonationAmount) || 0;

        return formattedDonationAmount;
    }
};

export default model;