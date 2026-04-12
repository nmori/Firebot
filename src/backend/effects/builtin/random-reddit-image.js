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
        name: "Reddit縺ｮ繝ｩ繝ｳ繝繝逕ｻ蜒・,
        description: "驕ｸ謚槭＆繧後◆subreddits縺九ｉ繝ｩ繝ｳ繝繝縺ｪ逕ｻ蜒上ｒ蜿悶ｊ蜃ｺ縺励∪縺吶・,
        icon: "fab fa-reddit-alien",
        categories: [EffectCategory.FUN, EffectCategory.CHAT_BASED, EffectCategory.OVERLAY],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="Subreddit 蜷・>
        <div class="input-group">
            <span class="input-group-addon" id="reddit-effect-type">r/</span>
            <input ng-model="effect.reddit" type="text" class="form-control" id="reddit-setting" aria-describedby="chat-text-effect-type" placeholder="puppies">
        </div>
    </eos-container>

    <eos-container header="蜃ｺ蜉帛・" pad-top="true" ng-if="effect.reddit !== null && effect.reddit !== 'Pick one'">
        <div class="controls-fb-inline" style="padding-bottom: 5px;">
            <label class="control-fb control--radio">繝√Ε繝・ヨ
                <input type="radio" ng-model="effect.show" value="chat"/>
                <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">繧ｪ繝ｼ繝舌・繝ｬ繧､
                <input type="radio" ng-model="effect.show" value="overlay"/>
                <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">荳｡譁ｹ
                <input type="radio" ng-model="effect.show" value="both"/>
                <div class="control__indicator"></div>
            </label>
        </div>
    </eos-container>

    <div class="effect-reddit-settings" ng-if="effect.show === 'chat' || effect.show ==='both'">
        <eos-chatter-select effect="effect" title="繝√Ε繝・ヨ" class="setting-padtop"></eos-chatter-select>
    </div>

    <div class="effect-reddit-settings" ng-if="effect.show === 'overlay' || effect.show ==='both'">
        <div class="effect-setting-container setting-padtop">
            <div class="effect-specific-title"><h4>髟ｷ縺・/h4></div>
            <div class="effect-setting-content">
                <div class="input-group">
                    <input
                    type="text"
                    class="form-control"
                    aria-describedby="image-length-effect-type"
                    type="number"
                    ng-model="effect.length">
                    <span class="input-group-addon">遘・/span>
                </div>
            </div>
        </div>
        <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
    </div>

    <eos-container pad-top="true">
        <div class="effect-info alert alert-danger">
        隴ｦ蜻・縺薙・貍泌・縺ｯReddit縺九ｉ繝ｩ繝ｳ繝繝縺ｪ逕ｻ蜒上ｒ蜿悶ｊ蜃ｺ縺励∪縺吶るｫ伜ｺｦ縺ｫ繝｢繝・Ξ繝ｼ繝医＆繧後◆subreddits縺ｯ縺九↑繧雁ｮ牙・縺ｧ縺吶′縲∝ｸｸ縺ｫ繧ｨ繝・メ縺ｪ逕ｻ蜒上・蜿ｯ閭ｽ諤ｧ縺後≠繧翫∪縺吶りｭｦ蜻翫〒縺・/div>
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
            errors.push("subreddit繧貞・蜉帙＠縺ｦ縺上□縺輔＞");
        }

        if (effect.show == null) {
            errors.push("reddit縺ｮ逕ｻ蜒上ｒ陦ｨ遉ｺ縺吶ｋ蝣ｴ謇繧帝∈謚槭＠縺ｦ縺上□縺輔＞");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const chatter = event.effect.chatter;
        const subName = event.effect.reddit;
        const imageUrl = await redditProcessor.getRandomImage(subName);

        try {
            logger.debug(`Random Reddit: ${imageUrl}`);
            if (event.effect.show === "chat" || event.effect.show === "both") {
                await twitchChat.sendChatMessage(`Random Reddit: ${imageUrl}`, null, chatter);
            }

            if (event.effect.show === "overlay" || event.effect.show === "both") {
                // Send image to overlay.
                const position = event.effect.position !== "Random" ? event.effect.position : mediaProcessor.getRandomPresetLocation();

                const data = {
                    url: imageUrl,
                    imageType: "url",
                    imagePosition: position,
                    imageHeight: event.effect.height ? `${event.effect.height}px` : "auto",
                    imageWidth: event.effect.width ? `${event.effect.width}px` : "auto",
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
                "reddit縺ｮ逕ｻ蜒上ｒ騾∽ｿ｡縺吶ｋ髫帙↓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・
            );
        }

        return true;
    }
};

module.exports = model;
