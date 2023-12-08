"use strict";

const redditProcessor = require("../../common/handlers/redditProcessor");
const twitchChat = require("../../chat/twitch-chat");
const mediaProcessor = require("../../common/handlers/mediaProcessor");
const settings = require("../../common/settings-access").settings;
const logger = require("../../logwrapper");
const webServer = require("../../../server/http-server-manager");
const { EffectCategory } = require('../../../shared/effect-constants');

const model = {
    definition: {
        id: "firebot:randomReddit",
        name: "Redditのランダム画像",
        description: "選択されたsubredditsからランダムな画像を取り出します。",
        icon: "fab fa-reddit-alien",
        categories: [EffectCategory.FUN, EffectCategory.CHAT_BASED, EffectCategory.OVERLAY],
        dependencies: []
    },
    globalSettings: {},
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
        <eos-chatter-select effect="effect" title="チャット" class="setting-padtop"></eos-chatter-select>
    </div>

    <div class="effect-reddit-settings" ng-if="effect.show === 'overlay' || effect.show ==='both'">
        <eos-overlay-position effect="effect" class="setting-padtop"></eos-overlay-position>
        <eos-enter-exit-animations effect="effect" class="setting-padtop"></eos-enter-exit-animations>
        <div class="effect-setting-container setting-padtop">
            <div class="effect-specific-title"><h4>大きさ</h4></div>
            <div class="effect-setting-content">
                <div class="input-group">
                    <span class="input-group-addon">幅</span>
                    <input
                        type="number"
                        class="form-control"
                        aria-describeby="image-width-setting-type"
                        type="number"
                        ng-model="effect.width"
                        placeholder="px">
                    <span class="input-group-addon">高さ</span>
                    <input
                        type="number"
                        class="form-control"
                        aria-describeby="image-height-setting-type"
                        type="number"
                        ng-model="effect.height"
                        placeholder="px">
                </div>
            </div>
        </div>
        <div class="effect-setting-container setting-padtop">
            <div class="effect-specific-title"><h4>長さ</h4></div>
            <div class="effect-setting-content">
                <div class="input-group">
                    <input
                    type="text"
                    class="form-control"
                    aria-describedby="image-length-effect-type"
                    type="number"
                    ng-model="effect.length">
                    <span class="input-group-addon">秒</span>
                </div>
            </div>
        </div>
        <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
    </div>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-danger">
        警告 この演出はRedditからランダムな画像を取り出します。高度にモデレートされたsubredditsはかなり安全ですが、常にエッチな画像の可能性があります。警告です</div>
    </eos-container>

    `,
    optionsController: ($scope) => {

        if ($scope.effect.show == null) {
            $scope.effect.show = "chat";
        }

    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.reddit == null) {
            errors.push("subredditを入力してください");
        }

        if (effect.show == null) {
            errors.push("redditの画像を表示する場所を選択してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const chatter = event.effect.chatter;
        const subName = event.effect.reddit;
        const imageUrl = await redditProcessor.getRandomImage(subName);

        try {
            logger.debug("Random Reddit: " + imageUrl);
            if (event.effect.show === "chat" || event.effect.show === "both") {
                await twitchChat.sendChatMessage("Random Reddit: " + imageUrl, null, chatter);
            }

            if (event.effect.show === "overlay" || event.effect.show === "both") {
                // Send image to overlay.
                const position = event.effect.position !== "Random" ? event.effect.position : mediaProcessor.getRandomPresetLocation();

                const data = {
                    url: imageUrl,
                    imageType: "url",
                    imagePosition: position,
                    imageHeight: event.effect.height ? event.effect.height + "px" : "auto",
                    imageWidth: event.effect.width ? event.effect.width + "px" : "auto",
                    imageDuration: event.effect.length,
                    enterAnimation: event.effect.enterAnimation,
                    exitAnimation: event.effect.exitAnimation,
                    customCoords: event.effect.customCoords
                };


                if (settings.useOverlayInstances()) {
                    if (event.effect.overlayInstance != null) {
                        if (
                            settings
                                .getOverlayInstances()
                                .includes(event.effect.overlayInstance)
                        ) {
                            data.overlayInstance = event.effect.overlayInstance;
                        }
                    }
                }

                // Send to overlay.
                webServer.sendToOverlay("image", data);
            }
        } catch (err) {
            renderWindow.webContents.send(
                "error",
                "redditの画像を送信する際にエラーが発生しました。"
            );
        }

        return true;
    }
};

module.exports = model;
