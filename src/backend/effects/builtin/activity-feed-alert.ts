import type { EffectType } from "../../../types/effects";
import { ActivityFeedManager } from "../../events/activity-feed-manager";

const effect: EffectType<{
    message: string;
    icon: string;
}> = {
    definition: {
        id: "firebot:activity-feed-alert",
        name: "アクティビティフィードにアラートを出す",
        description: "Firebotのアクティビティフィードにアラートを表示する",
        icon: "fad fa-comment-exclamation",
        categories: ["dashboard"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container>
        <p>Firebotのアクティビティフィードでアラートを送信します。</p>
    </eos-container>
    <eos-container header="Message" pad-top="true">
        <firebot-input
            model="effect.message"
            placeholder-text="メッセージ"
            use-text-area="true"
            rows="4"
            cols="40"
            menu-position="under"
        />
    </eos-container>
    <eos-container header="アイコン" pad-top="true">
        <input
			maxlength="2"
			type="text"
			class="form-control"
			ng-model="effect.icon"
			icon-picker required
		/>
    </eos-container>
    `,
    optionsController: () => { },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.message == null || effect.message === "") {
            errors.push("アラートメッセージを空白にすることはできません。");
        }
        return errors;
    },
    onTriggerEvent: ({ effect }) => {
        ActivityFeedManager.handleTriggeredEvent(
            {
                id: "firebot",
                name: "Firebot"
            },
            {
                id: "activity-feed-alert",
                name: "アクティビティフィードへアラートを送る",
                activityFeed: {
                    icon: effect.icon || "fad fa-comment-exclamation",
                    getMessage: () => {
                        return effect.message;
                    }
                }
            },
            {
                username: "firebot"
            },
            {
                forceAllow: true,
                canRetrigger: false
            });

        return true;
    }
};

export = effect;