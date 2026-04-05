import { getParticipant } from 'extra-life-ts';
import { ReplaceVariable } from "../../../../../types/variables";
import integrationManager from "../../../../integrations/integration-manager";

const ExtraLifeInfo: ReplaceVariable = {
    definition: {
        handle: "extraLifeInfo",
        description: "Extra Life プロフィールから指定データを返します。詳細は例を参照してください。",
        examples: [
            {
                usage: 'extraLifeInfo[fundraisingGoal]',
                description: "現在ログイン中の Extra Life アカウントの募金目標額を返します。"
            },
            {
                usage: 'extraLifeInfo[fundraisingGoal, participantID]',
                description: "指定した participantID の募金目標額を返します。"
            },
            {
                usage: 'extraLifeInfo[eventName, participantID]',
                description: "募金イベント名（例: Extra Life 2024）を返します。"
            },
            {
                usage: 'extraLifeInfo[donateLink, participantID]',
                description: "寄付リンクを返します。"
            },
            {
                usage: 'extraLifeInfo[profileLink, participantID]',
                description: "プロフィールリンクを返します。"
            },
            {
                usage: 'extraLifeInfo[sumDonations, participantID]',
                description: "現在の寄付合計額を返します。"
            },
            {
                usage: 'extraLifeInfo[sumPledges, participantID]',
                description: "現在の誓約合計額を返します。"
            },
            {
                usage: 'extraLifeInfo[numIncentives, participantID]',
                description: "インセンティブ数を返します。"
            },
            {
                usage: 'extraLifeInfo[numMilestones, participantID]',
                description: "マイルストーン数を返します。"
            },
            {
                usage: 'extraLifeInfo[numDonations, participantID]',
                description: "寄付件数を返します。"
            },
            {
                usage: 'extraLifeInfo[avatarImageURL, participantID]',
                description: "Extra Life のアバター画像URLを返します。"
            },
            {
                usage: 'extraLifeInfo[null, null, true]',
                description: "現在ログイン中の Extra Life アカウントのプロフィール全データを JSON 形式で返します。"
            }
        ],
        categories: ["common", "integrations"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, infoPath: string, participantID: number, returnJson: boolean) => {
        if (participantID == null) {
            participantID = integrationManager.getIntegrationAccountId("extralife");
        }

        if (infoPath == null || infoPath.trim() === '') {
            infoPath = 'fundraisingGoal';
        }

        return getParticipant(participantID).then(({ data }) => {
            if (returnJson) {
                return JSON.stringify(data);
            }

            if (infoPath === "donateLink") {
                return data.links.donate;
            }

            if (infoPath === "profileLink") {
                return data.links.page;
            }

            return data[infoPath];
        });
    }
};

export = ExtraLifeInfo;