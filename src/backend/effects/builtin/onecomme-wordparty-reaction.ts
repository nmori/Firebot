import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

const model: EffectType<{
    key: string;
}, {
    httpResponse: string;
}> = {
    definition: {
        id: "firebot:onecomme-wordparty-reaction",
        name: "わんコメ WordParty",
        description: "わんコメのWordPartyに起動トリガーを送ります",
        icon: "fad fa-paw",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: [],
        outputs: []
    },
    optionsTemplate: `
        <eos-container header="送信するコメント">
            <firebot-input model="effect.key" placeholder-text="コメントの入力" menu-position="below"></firebot-input>
        </eos-container>

        <eos-container pad-top="true">
            <div class="effect-info alert alert-warning">
                注意: わんコメのWordPartyで発火する文字列の設定が別途必要です。
            </div>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.key == null || effect.key === "") {
            errors.push("コメント文字列を入力してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        try {
            const response = await fetch("http://localhost:11180/api/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reactions: [{ key: effect.key, value: 1 }],
                    effect: true
                })
            });

            const responseData = await response.text();
            return {
                success: true,
                outputs: {
                    httpResponse: responseData
                }
            };
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return {
            success: false,
            outputs: {}
        };
    }
};

export = model;
