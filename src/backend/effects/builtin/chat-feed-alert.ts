import { EffectType } from '../../../types/effects';
import frontendCommunicator from '../../common/frontend-communicator';

const effect: EffectType<{
    message: string;
    icon: string;
}> = {
    definition: {
        id: "firebot:chat-feed-alert",
        name: "チャットフィードアラート",
        description: "Firebot のチャットフィードにアラートを表示します",
        icon: "fad fa-exclamation-circle",
        categories: ["common", "dashboard", "chat based"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container>
        <p>このエフェクトを使うと、実際のチャットメッセージを送らずに、Firebot のチャットフィードへ自分宛のアラートを表示できます。アラートはあなたにしか見えません。</p>
    </eos-container>
    <eos-container header="アラートのメッセージ" pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="メッセージを入力"
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
    optionsController: ($scope) => {
        // Backward compatibility from when the icon was hard-coded
        if ($scope.effect.icon == null || $scope.effect.icon === "") {
            $scope.effect.icon = "fad fa-exclamation-circle";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.message == null || effect.message === "") {
            errors.push("アラートのメッセージを入力してください。");
        }
        if (effect.icon == null || effect.icon === "") {
            errors.push("アイコンを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: (event) => {

        const { effect } = event;

        frontendCommunicator.send("chatUpdate", {
            fbEvent: "ChatAlert",
            message: effect.message,
            icon: effect.icon
        });

        return true;
    }
};

export = effect;