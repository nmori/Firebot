import type { EffectType } from "../../../types";

import { ControlDeckManager } from "../../control-deck/control-deck-manager";
import { SettingsManager } from "../../common/settings-manager";

const effect: EffectType<{
    deckId: string;
}> = {
    definition: {
        id: "firebot:set-default-control-deck",
        name: "既定のコントロールデッキを設定",
        description: "新しいデバイスが接続したときに表示する既定のコントロールデッキを設定します",
        icon: "fad fa-star",
        categories: ["common", "firebot control"]
    },
    optionsTemplate: `
        <eos-container header="デッキ">
            <firebot-searchable-select
                ng-model="effect.deckId"
                placeholder="デッキを選択または検索..."
                items="controlDecks"
            />
        </eos-container>
    `,
    optionsController: ($scope, controlDeckService) => {
        $scope.controlDecks = controlDeckService.decks;
    },
    getDefaultLabel: (effect, controlDeckService) => {
        const deck = controlDeckService.decks.find(deck => deck.id === effect.deckId);
        const deckName = deck?.name ?? "不明なデッキ";
        return deckName;
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.deckId) {
            errors.push("コントロールデッキを選択してください。");
        }
        return errors;
    },
    onTriggerEvent: ({ effect }) => {
        const decks = ControlDeckManager.getAllItems();
        const deck = decks.find(d => d.id === effect.deckId);
        if (!deck) {
            return true;
        }
        SettingsManager.saveSetting("ControlDeckDefaultDeckId", effect.deckId);
        return true;
    }
};

export = effect;