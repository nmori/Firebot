import { CustomReward } from "../backend/twitch-api/resource/channel-rewards";
import { EffectList } from "./effects";

export type SavedChannelReward = {
    id: string,
    twitchData: CustomReward,
    manageable: boolean,
    effects?: EffectList
};

export type RewardRedemptionMetadata = {
    username: string,
<<<<<<< HEAD
    displayName: string,
=======
    userId: string,
    userDisplayName: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    messageText: string,
    redemptionId: string,
    rewardId: string,
    rewardImage: string,
    rewardName: string,
    rewardCost: number
};