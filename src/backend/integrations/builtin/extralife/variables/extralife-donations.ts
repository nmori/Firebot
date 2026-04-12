import { GetDonationsOptions, getParticipantDonations } from 'extra-life-ts';
import { ReplaceVariable } from "../../../../../types/variables";
import integrationManager from "../../../../integrations/integration-manager";

const ExtraLifeDonations: ReplaceVariable = {
    definition: {
        handle: "extraLifeDonations",
        description: "Extra Life の寄付情報を返します。",
        examples: [
            {
                usage: 'extraLifeDonations[amount]',
                description: "現在サインイン中の Extra Life アカウントで最高額の寄付を返します。"
            },
            {
                usage: 'extraLifeDonations[amount, 1, participantID]',
                description: "指定した participantID で最高額の寄付を返します。"
            },
            {
                usage: 'extraLifeDonations[amount, 3, participantID]',
                description: "指定した participantID の上位3件の寄付を返します。"
            },
            {
                usage: 'extraLifeDonations[createdDateUTC, 5, participantID]',
                description: "指定した participantID の最新5件の寄付を返します。"
            },
            {
                usage: 'extraLifeDonations[createdDateUTC, 5, participantID, true]',
                description: "指定した participantID の最新5件の寄付を JSON 形式で返します。"
            },
            {
                usage: 'extraLifeDonations[amount, 3, null, true]',
                description: "現在サインイン中の Extra Life アカウントの上位3件の寄付を JSON 形式で返します。"
            }
        ],
        categories: ["common", "integrations"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, sortName: string, numResults: number, participantID: number, returnJson: boolean) => {
        if (numResults == null) {
            numResults = 1;
        }

        if (participantID == null) {
            participantID = integrationManager.getIntegrationAccountId("extralife");
        }

        if (sortName == null || sortName.trim() === '') {
            sortName = 'amount';
        }

        return getParticipantDonations(participantID, { limit: numResults, orderBy: `${sortName} DESC` } as GetDonationsOptions)
            .then(({ data }) => {
                if (returnJson) {
                    return JSON.stringify(data);
                }

                if (data.length === 0) {
                    return "No donations yet!";
                }

                let donationString = "";
                data.forEach((donation) => {
                    donationString += `${donation.displayName} - $${donation.amount}. `;
                });

                return donationString.trim();
            });
    }
};

export = ExtraLifeDonations;