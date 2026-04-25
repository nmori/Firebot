import { EffectType } from "../../../types/effects";
import frontendCommunicator from "../../common/frontend-communicator";

const effect: EffectType<{
    text: string;
}> = {
    definition: {
        id: "firebot:copy-to-clipboard",
        name: "テキストをクリップボードへコピー",
        description: "テキストをシステムクリップボードにコピーします",
        icon: "fad fa-copy",
        categories: ["advanced", "scripting"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="コピーするテキスト">
            <textarea ng-model="effect.text" id="clipboard-text" class="form-control" placeholder="コピーするテキストを入力" menu-position="under" replace-variables></textarea>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!(effect.text?.length > 0)) {
            errors.push("テキストを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        frontendCommunicator.send("copy-to-clipboard", {
            text: effect.text
        });
    }
};

export = effect;