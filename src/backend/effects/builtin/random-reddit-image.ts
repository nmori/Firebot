import type {
    EffectType,
    OverlayDimensions,
    OverlayEnterExitAnimations,
    OverlayInstance,
    OverlayPosition,
    OverlayRotation
} from '../../../types/effects';
import { SettingsManager } from "../../common/settings-manager";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import mediaProcessor from "../../common/handlers/mediaProcessor";
import webServer from "../../../server/http-server-manager";
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";
import { getRandomImage } from "../../common/handlers/reddit-processor";

const model: EffectType<{
    reddit: string;
    show: string;
    chatter: string;
    length: number;
}
& OverlayDimensions
& OverlayPosition
& OverlayRotation
& OverlayEnterExitAnimations
& OverlayInstance
> = {
    definition: {
        id: "firebot:randomReddit",
        name: "Redditランダム画像",
        description: "選択した subreddit からランダムな画像を取得します。",
        icon: "fab fa-reddit-alien",
        categories: ["fun", "chat based", "overlay"],
        dependencies: [],
        hidden: true
    },
    optionsTemplate: `
    <eos-container header="Subreddit 名">
        <div class="input-group">
            <span class="input-group-addon" id="reddit-effect-type">r/</span>
            <input ng-model="effect.reddit" type="text" class="form-control" id="reddit-setting" aria-describedby="chat-text-effect-type" placeholder="puppies">
        </div>
    </eos-container>

    <eos-container header="出力先" pad-top="true" ng-if="effect.reddit !== null && effect.reddit !== 'Pick one'">
        <div class="controls-fb-inline" style="padding-bottom: 5px;">
            <label class="control-fb control--radio">チャット
                <input type="radio" ng-model="effect.show" value="chat"/>
                <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">オーバーレイ
                <input type="radio" ng-model="effect.show" value="overlay"/>
                <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">両方
                <input type="radio" ng-model="effect.show" value="both"/>
                <div class="control__indicator"></div>
            </label>
        </div>
    </eos-container>

    <div class="effect-reddit-settings" ng-if="effect.show === 'chat' || effect.show ==='both'">
        <eos-chatter-select effect="effect" title="送信元" class="setting-padtop"></eos-chatter-select>
    </div>

    <div class="effect-reddit-settings" ng-if="effect.show === 'overlay' || effect.show ==='both'">
        <div class="effect-setting-container setting-padtop">
            <div class="effect-specific-title"><h4>表示時間</h4></div>
            <div class="effect-setting-content">
                <div class="input-group">
                    <span class="input-group-addon">秒数</span>
                    <input
                    type="text"
                    class="form-control"
                    aria-describedby="image-length-effect-type"
                    type="number"
                    ng-model="effect.length">
                </div>
            </div>
        </div>

        <eos-overlay-dimensions effect="effect" pad-top="true"></eos-overlay-dimensions>

        <eos-overlay-position effect="effect" class="setting-padtop"></eos-overlay-position>

        <eos-overlay-rotation effect="effect" pad-top="true"></eos-overlay-rotation>

        <eos-enter-exit-animations effect="effect" class="setting-padtop"></eos-enter-exit-animations>

        <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
        <div class="effect-info alert alert-warning">
            このエフェクトを使用するには、配信ソフトに Firebot オーバーレイを読み込む必要があります。 <a href ng-click="showOverlayInfoModal()" style="text-decoration:underline">詳細を見る</a>
        </div>
    </div>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-danger">
        警告: このエフェクトは subreddit からランダムな画像を取得します。モデレーションがしっかり行われている subreddit であれば概ね安全ですが、不適切な画像が表示される可能性が常にあります。利用は自己責任でお願いします。
        </div>
    </eos-container>

    `,
    optionsController: ($scope) => {

        if ($scope.effect.show == null) {
            $scope.effect.show = "chat";
        }

    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.reddit == null) {
            errors.push("subreddit を入力してください。");
        }

        if (effect.show == null) {
            errors.push("Reddit 画像の表示場所を選択してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const chatter = event.effect.chatter;
        const subName = event.effect.reddit;
        const imageUrl = await getRandomImage(subName);

        try {
            logger.debug(`Random Reddit: ${imageUrl}`);
            if (event.effect.show === "chat" || event.effect.show === "both") {
                await TwitchApi.chat.sendChatMessage(`Random Reddit: ${imageUrl}`, null, chatter.toLowerCase() === "bot");
            }

            if (event.effect.show === "overlay" || event.effect.show === "both") {
                // Send image to overlay.
                const position = mediaProcessor.resolveRandomPosition(event.effect.position);

                const data = {
                    url: imageUrl,
                    imageType: "url",
                    imagePosition: position,
                    imageHeight: event.effect.height ? `${event.effect.height}px` : "auto",
                    imageWidth: event.effect.width ? `${event.effect.width}px` : "auto",
                    imageDuration: event.effect.length,
                    enterAnimation: event.effect.enterAnimation,
                    exitAnimation: event.effect.exitAnimation,
                    customCoords: event.effect.customCoords,
                    imageRotation: event.effect.rotation ? event.effect.rotation + event.effect.rotType : "0deg"
                };


                if (SettingsManager.getSetting("UseOverlayInstances")) {
                    if (event.effect.overlayInstance != null) {
                        if (
                            SettingsManager
                                .getSetting("OverlayInstances")
                                .includes(event.effect.overlayInstance)
                        ) {
                            data["overlayInstance"] = event.effect.overlayInstance;
                        }
                    }
                }

                // Send to overlay.
                webServer.sendToOverlay("image", data);
            }
        } catch {
            frontendCommunicator.send(
                "error",
                "There was an error sending a reddit picture."
            );
        }

        return true;
    }
};

export = model;