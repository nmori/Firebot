import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType } from "../../../../../shared/variable-constants";

const api = require("../../../../twitch-api/api");
const accountAccess = require("../../../../common/account-access");
const logger = require("../../../../../backend/logwrapper");

const model : ReplaceVariable = {
    definition: {
        handle: "subNames",
        description: "現在保持しているサブスクリプションの配列を返します。項目には 'username'、'tier' および 'isGift' プロパティが含まれます。",
        usage: "subNames",
        examples: [
            {
                usage: "subNames",
                description: "戻り値: [{username:Firebottle,tier:2000,isGift:false},{username:ebiggz,tier:1000,isGift:true},{username:SReject,tier:3000,isGift:false},{username:Perry,tier:1000,isGift:false}] 配列またはカスタム変数で使用できます"
            }
        ],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async () => {
        const { streamer } = accountAccess.getAccounts();
        let viewers = [];
        try {
            const response = await api.streamerClient.subscriptions
                .getSubscriptionsPaginated(streamer.channelId).getAll();
            if (response && response.length) {
                viewers = response.map(sub => ({
                    username: sub.userName,
                    displayname: sub.userDisplayName || sub.userName,
                    tier: sub.tier,
                    isGift: sub.isGift
                }));
            }
        } catch (err) {
            logger.error("Error while fetching streamer subscriptions", err);
        }

        return viewers;
    }
};

export default model;