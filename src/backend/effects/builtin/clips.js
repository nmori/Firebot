"use strict";

const clipProcessor = require("../../common/handlers/createClipProcessor");
const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const { settings } = require("../../common/settings-access");
const mediaProcessor = require("../../common/handlers/mediaProcessor");
const webServer = require("../../../server/http-server-manager");
const utils = require("../../utility");
const customVariableManager = require("../../common/custom-variable-manager");

const clip = {
    definition: {
        id: "firebot:clip",
        name: "クリップの作成",
        description: "Twitchでクリップを作成する",
        icon: "fad fa-film",
        categories: [EffectCategory.COMMON, EffectCategory.FUN, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT],
        outputs: [
            {
                label: "クリップUrl",
                description: "作成されたクリップのURL",
                defaultName: "clipUrl"
            }
        ]
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> チャットにクリップのリンクを貼る
                    <input type="checkbox" ng-model="effect.postLink">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px" ng-show="hasChannels">
                <label class="control-fb control--checkbox"> Discordチャンネルにクリップを投稿する
                    <input type="checkbox" ng-model="effect.postInDiscord">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div ng-show="effect.postInDiscord" style="margin-left: 30px;">
                <div>Discord チャンネル:</div>
                <dropdown-select options="channelOptions" selected="effect.discordChannelId"></dropdown-select>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> オーバーレイにクリップを表示する
                    <input type="checkbox" ng-model="effect.showInOverlay">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox">クリップのURLを変数に入れる<tooltip text="'クリップのURLを変数に入れ、後で使えるようにする'"></tooltip>
                    <input type="checkbox" ng-model="effect.options.putClipUrlInVariable">
                    <div class="control__indicator"></div>
                </label>
                <div ng-if="effect.options.putClipUrlInVariable" style="padding-left: 15px;">
                    <firebot-input input-title="変数" model="effect.options.variableName" placeholder-text="Enter name" />
                    <firebot-input style="margin-top: 10px;" input-title="変数の生存期間" model="effect.options.variableTtl" input-type="number" disable-variables="true" placeholder-text="秒数を入力 | 任意" />
                    <firebot-input style="margin-top: 10px;" input-title="変数のパス" model="effect.options.variablePropertyPath" input-type="text" disable-variables="true" placeholder-text="任意" />
                </div>
            </div>

            <!--<div style="padding-top:20px">
                <label class="control-fb control--checkbox"> クリップのダウンロード <tooltip text="'どのフォルダにクリップを保存するかは、「設定」タブで変更できます。'"></tooltip>
                    <input type="checkbox" ng-model="effect.download">
                    <div class="control__indicator"></div>
                </label>
            </div>-->
        </eos-container>

        <div ng-if="effect.showInOverlay">
            <eos-overlay-position effect="effect" class="setting-padtop"></eos-overlay-position>
            <eos-container header="Dimensions">
                <label class="control-fb control--checkbox"> アスペクト比率を16:9に強制する 
                    <input type="checkbox" ng-click="forceRatioToggle();" ng-checked="forceRatio">
                    <div class="control__indicator"></div>
                </label>
                <div class="input-group">
                    <span class="input-group-addon">幅 (pixels)</span>
                    <input
                        type="text"
                        class="form-control"
                        aria-describeby="video-width-setting-type"
                        type="number"
                        ng-change="calculateSize('Width', effect.width)"
                        ng-model="effect.width">
                    <span class="input-group-addon">高さ (pixels)</span>
                    <input
                        type="text"
                        class="form-control"
                        aria-describeby="video-height-setting-type"
                        type="number"
                        ng-change="calculateSize('Height', effect.height)"
                        ng-model="effect.height">
                </div>
            </eos-container>
            <eos-enter-exit-animations effect="effect" class="setting-padtop"></eos-enter-exit-animations>
            <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
        </div>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：この効果を発揮させるには、配信中である必要があります。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, $q, backendCommunicator) => {

        // Force ratio toggle
        $scope.forceRatio = true;
        $scope.forceRatioToggle = function() {
            if ($scope.forceRatio === true) {
                $scope.forceRatio = false;
            } else {
                $scope.forceRatio = true;
            }
        };

        if ($scope.effect.options == null) {
            $scope.effect.options = { };
        }

        // Calculate 16:9
        // This checks to see which field the user is filling out, and then adjust the other field so it's always 16:9.
        $scope.calculateSize = function(widthOrHeight, size) {
            if (size !== "") {
                if (widthOrHeight === "Width" && $scope.forceRatio) {
                    $scope.effect.height = String(Math.round(size / 16 * 9));
                } else if (widthOrHeight === "Height" && $scope.forceRatio) {
                    $scope.effect.width = String(Math.round(size * 16 / 9));
                }
            } else {
                $scope.effect.height = "";
                $scope.effect.width = "";
            }
        };

        if ($scope.effect.clipDuration == null) {
            $scope.effect.clipDuration = 30;
        }

        $scope.hasChannels = false;
        $scope.channelOptions = {};
        $q.when(backendCommunicator.fireEventAsync("getDiscordChannels"))
            .then(channels => {
                if (channels && channels.length > 0) {
                    const newChannels = {};

                    for (const channel of channels) {
                        newChannels[channel.id] = channel.name;
                    }

                    if ($scope.effect.channelId == null ||
                        newChannels[$scope.effect.channelId] == null) {
                        $scope.effect.channelId = channels[0].id;
                    }

                    $scope.channelOptions = newChannels;

                    $scope.hasChannels = true;
                }
            });
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.postInDiscord && effect.discordChannelId == null) {
            errors.push("Discord チャネルを選んでください");
        }
        if (effect.options.putClipUrlInVariable && !(effect.options.variableName?.length > 0)) {
            errors.push("変数名を入力してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const clip = await clipProcessor.createClip(effect);
        if (clip != null) {
            const clipDuration = clip.duration;

            if (effect.showInOverlay) {

                let position = effect.position;
                if (position === "Random") {
                    position = mediaProcessor.randomLocation();
                }

                let overlayInstance = null;
                if (settings.useOverlayInstances()) {
                    if (effect.overlayInstance != null) {
                        if (settings.getOverlayInstances().includes(effect.overlayInstance)) {
                            overlayInstance = effect.overlayInstance;
                        }
                    }
                }

                webServer.sendToOverlay("playTwitchClip", {
                    clipSlug: clip.id,
                    width: effect.width,
                    height: effect.height,
                    duration: clipDuration,
                    position: position,
                    customCoords: effect.customCoords,
                    enterAnimation: effect.enterAnimation,
                    enterDuration: effect.enterDuration,
                    inbetweenAnimation: effect.inbetweenAnimation,
                    inbetweenDuration: effect.inbetweenDuration,
                    inbetweenDelay: effect.inbetweenDelay,
                    inbetweenRepeat: effect.inbetweenRepeat,
                    exitAnimation: effect.exitAnimation,
                    exitDuration: effect.exitDuration,
                    overlayInstance: overlayInstance
                });
            }

            if (effect.options.putClipUrlInVariable) {
                customVariableManager.addCustomVariable(
                    effect.options.variableName,
                    clip.url,
                    effect.options.variableTtl || 0,
                    effect.options.variablePropertyPath || null
                );
            }

            await utils.wait(clipDuration * 1000);
        }
        return clip != null;
    },
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "playTwitchClip",
            onOverlayEvent: event => {
                const {
                    clipVideoUrl,
                    volume,
                    width,
                    height,
                    duration,
                    position,
                    customCoords,
                    enterAnimation,
                    enterDuration,
                    inbetweenAnimation,
                    inbetweenDuration,
                    inbetweenDelay,
                    inbetweenRepeat,
                    exitAnimation,
                    exitDuration
                } = event;

                const styles = (width ? `width: ${width}px;` : '') +
                    (height ? `height: ${height}px;` : '');

                const videoElement = `
                    <video autoplay
                        src="${clipVideoUrl}"
                        height="${height || ""}"
                        width="${width || ""}"
                        style="border: none;${styles}"
                        onloadstart="this.volume=${volume}"
                        allowfullscreen="false" />
                `;

                const positionData = {
                    position: position,
                    customCoords: customCoords
                };

                const animationData = {
                    enterAnimation: enterAnimation,
                    enterDuration: enterDuration,
                    inbetweenAnimation: inbetweenAnimation,
                    inbetweenDelay: inbetweenDelay,
                    inbetweenDuration: inbetweenDuration,
                    inbetweenRepeat: inbetweenRepeat,
                    exitAnimation: exitAnimation,
                    exitDuration: exitDuration,
                    totalDuration: parseFloat(duration) * 1000
                };

                showElement(videoElement, positionData, animationData); // eslint-disable-line no-undef

            }
        }
    }
};

module.exports = clip;
