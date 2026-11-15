import type { EffectType } from "../../../types";

import { HttpServerManager } from "../../../server/http-server-manager";
import { ControlDeckManager } from "../../control-deck/control-deck-manager";

const effect: EffectType<{
    deckId: string;
    pageId?: string;
}> = {
    definition: {
        id: "firebot:set-active-control-deck",
        name: "アクティブなコントロールデッキを設定",
        description: "接続中のデバイスで表示するコントロールデッキとページを設定します",
        icon: "fad fa-grip-horizontal",
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

        <eos-container header="ページ" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.pageId"
                placeholder="ページを選択または検索..."
                items="deckPages"
            />
        </eos-container>
    `,
    optionsController: ($scope, controlDeckService) => {
        $scope.controlDecks = controlDeckService.decks;

        $scope.deckPages = [];

        $scope.$watch("effect.deckId", (newVal) => {
            const selectedDeck = controlDeckService.decks.find(deck => deck.id === newVal);
            $scope.deckPages = [
                {
                    id: undefined,
                    name: "既定（最初）のページ"
                },
                ...(selectedDeck?.pages || [])
            ];
        });

    },
    getDefaultLabel: (effect, controlDeckService) => {
        const deck = controlDeckService.decks.find(deck => deck.id === effect.deckId);
        const deckName = deck?.name ?? "不明なデッキ";
        const pageName = deck?.pages?.find(page => page.id === effect.pageId)?.name ?? "既定のページ";
        return `${deckName} - ${pageName}`;
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
        const pageId = effect.pageId ? deck.pages.find(p => p.id === effect.pageId)?.id : undefined;
        HttpServerManager.sendToControlDecks("control-deck:set-active-deck", {
            deckId: effect.deckId,
            pageId
        });
        return true;
    }
};

export = effect;