import { getParticipantMilestones, getParticipant } from 'extra-life-ts';
import { ReplaceVariable } from "../../../../../types/variables";
import integrationManager from "../../../../integrations/integration-manager";

const ExtraLifeMilestones: ReplaceVariable = {
    definition: {
        handle: "extraLifeMilestones",
        description: "Extra Life のマイルストーン情報を返します。詳細は例を参照してください。",
        examples: [
            {
                usage: 'extraLifeMilestones[]',
                description: "ログイン中の Extra Life アカウントに対する次のマイルストーンを返します。"
            },
            {
                usage: 'extraLifeMilestones[null, 1, participantID]',
                description: "指定した participantID に対する次のマイルストーンを返します。"
            },
            {
                usage: 'extraLifeMilestones[75, 1, participantID]',
                description: "指定した participantID のうち、目標額が $75 のマイルストーンを返します。"
            },
            {
                usage: 'extraLifeMilestones[75]',
                description: "ログイン中の Extra Life アカウントのうち、目標額が $75 のマイルストーンを返します。"
            },
            {
                usage: 'extraLifeMilestones[null, 3, participantID, true]',
                description: "3件のマイルストーンを JSON 形式で返します。"
            }
        ],
        categories: ["common", "integrations"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (_, milestoneGoal: string, numResults: number, participantID: number, returnJson: boolean) => {
        if (numResults == null) {
            numResults = 1;
        }

        if (participantID == null) {
            participantID = integrationManager.getIntegrationAccountId("extralife");
        }

        if (milestoneGoal.trim() === '') {
            milestoneGoal = null;
        }

        const currentDonations = await getParticipant(participantID).then(({ data }) => {
            if (data) {
                return data.sumDonations;
            }

            return 0;
        });

        let extraLifeCall = await getParticipantMilestones(participantID, { orderBy: 'fundraisingGoal ASC' }).then(({ data }) => {
            let result = data;
            if (milestoneGoal != null) {
                result = result.filter(function (milestone) {
                    return milestone.fundraisingGoal === parseInt(milestoneGoal);
                });
            } else {
                result = result.filter(function (milestone) {
                    return milestone.fundraisingGoal >= currentDonations;
                });
            }

            return result;
        });

        extraLifeCall = extraLifeCall.slice(0, numResults);

        if (returnJson) {
            return JSON.stringify(extraLifeCall);
        }

        let milestoneString = "";
        extraLifeCall.forEach((milestone) => {
            milestoneString += `$${milestone.fundraisingGoal} - ${milestone.description}. `;
        });

        return milestoneString.trim();
    }
};

export = ExtraLifeMilestones;