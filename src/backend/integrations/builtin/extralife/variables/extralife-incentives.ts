import { getParticipantIncentives } from 'extra-life-ts';
import { ReplaceVariable } from "../../../../../types/variables";
import integrationManager from "../../../../integrations/integration-manager";

const ExtraLifeIncentives: ReplaceVariable = {
    definition: {
        handle: "extraLifeIncentives",
        description: "Extra Life のインセンティブ情報を返します。詳細は例を参照してください。",
        examples: [
            {
                usage: 'extraLifeIncentives[]',
                description: "ログイン中の Extra Life アカウントに対するインセンティブ1件を返します。"
            },
            {
                usage: 'extraLifeIncentives[Play one handed]',
                description: "ログイン中の Extra Life アカウントで、説明が 'Play one handed' のインセンティブ1件を返します。"
            },
            {
                usage: 'extraLifeIncentives[Play one handed, 1, participantID]',
                description: "指定した participantID で、説明が 'Play one handed' のインセンティブ1件を返します。"
            },
            {
                usage: 'extraLifeIncentives[null, 3, participantID]',
                description: "指定した participantID のインセンティブを3件返します。"
            },
            {
                usage: 'extraLifeIncentives[null, 10, null, true]',
                description: "現在ログイン中の Extra Life アカウントのインセンティブ10件を JSON 形式で返します。"
            }
        ],
        categories: ["common", "integrations"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (_, rewardDesc: string, numResults: number, participantID: number, returnJson: boolean) => {
        if (numResults == null) {
            numResults = 1;
        }

        if (participantID == null) {
            participantID = integrationManager.getIntegrationAccountId("extralife");
        }

        if (rewardDesc == null || rewardDesc.trim() === '') {
            rewardDesc = null;
        }

        let extraLifeCall = await getParticipantIncentives(participantID, { orderBy: 'amount ASC' }).then(({ data }) => {
            let result = data;
            if (rewardDesc != null) {
                result = data.filter(function (incentive) {
                    return incentive.description === rewardDesc.trim();
                });
            }

            return result;
        });

        extraLifeCall = extraLifeCall.slice(0, numResults);

        if (returnJson) {
            return JSON.stringify(extraLifeCall);
        }

        let incentiveString = "";
        extraLifeCall.forEach((incentive) => {
            incentiveString += `$${incentive.amount} - ${incentive.description}. `;
        });

        return incentiveString.trim();
    }
};

export = ExtraLifeIncentives;