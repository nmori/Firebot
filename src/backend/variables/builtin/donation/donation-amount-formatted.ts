import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["streamlabs:donation", "streamlabs:eldonation", "tipeeestream:donation", "streamelements:donation", "extralife:donation"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "donationAmountFormatted",
        description: "寄付金額（通貨記号付き）",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        const formattedDonationAmount = (trigger.metadata.eventData && trigger.metadata.eventData.formattedDonationAmount) || 0;

        return formattedDonationAmount;
    }
};

export default model;