import type { EffectType } from '../../../types/effects';
import frontendCommunicator from "../../common/frontend-communicator";

const effect: EffectType = {
    definition: {
        id: "firebot:mark-all-activity-acknowledged",
        name: "すべての活動を承認済みとしてマークする",
        description: "チャットページですべてのアクティビティを承認済みとしてマークします。",
        icon: "fad fa-comment-dots",
        categories: ["common"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container pad-top="true">
            <p>この演出が実行されると、チャットページのイベント履歴内のすべてのアクティビティが確認済みとしてマークされます。ホットキーやStreamDeckに接続することで、現在のすべてのアクティビティを素早く確認することができます。</p>
        </eos-container>
    `,
    onTriggerEvent: () => {
        frontendCommunicator.send("activity-feed:acknowledge-all-activity");
        return true;
    }
};

export = effect;