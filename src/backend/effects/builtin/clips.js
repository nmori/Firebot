"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const { CustomVariableManager } = require("../../common/custom-variable-manager");
const { SettingsManager } = require("../../common/settings-manager");
const { TwitchApi } = require("../../streaming-platforms/twitch/api");
const mediaProcessor = require("../../common/handlers/mediaProcessor");
const webServer = require("../../../server/http-server-manager");
const logger = require("../../logwrapper");
const { wait } = require("../../utils");
const { resolveTwitchClipVideoUrl } = require("../../common/handlers/twitch-clip-url-resolver");
const discord = require("../../integrations/builtin/discord/discord-message-sender");
const discordEmbedBuilder = require("../../integrations/builtin/discord/discord-embed-builder");

const clip = {
    definition: {
        id: "firebot:clip",
        name: "クリップ作成",
        description: "Twitch でクリップを作成します。",
        icon: "fad fa-film",
        categories: [EffectCategory.COMMON, EffectCategory.FUN, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT],
        outputs: [
            {
                label: "クリップURL",
                description: "作成されたクリップのURL",
                defaultName: "clipUrl"
            },
            {
                label: "サムネイルURL",
                description: "作成されたクリップのサムネイル画像のURL",
                defaultName: "thumbnailUrl"
            }
        ]
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> クリップのリンクをチャットに投稿
                    <input type="checkbox" ng-model="effect.postLink">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px" ng-show="hasChannels">
                <label class="control-fb control--checkbox"> クリップを Discord チャンネルに投稿
                    <input type="checkbox" ng-model="effect.postInDiscord">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div ng-show="effect.postInDiscord" style="margin-left: 30px;">
                <div>Discord チャンネル:</div>
                <dropdown-select options="channelOptions" selected="effect.discordChannelId"></dropdown-select>
                <div style="margin-top:10px;">
                    <color-picker-input model="effect.embedColor" label="埋め込みの色"></color-picker-input>
                </div>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> オーバーレイにクリップを表示
                    <input type="checkbox" ng-model="effect.showInOverlay">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> クリップURLを $customVariable に保存 <tooltip text="'クリップURLを $customVariable に保存して、後から利用できるようにします。'"></tooltip>
                    <input type="checkbox" ng-model="effect.options.putClipUrlInVariable">
                    <div class="control__indicator"></div>
                </label>
                <div ng-if="effect.options.putClipUrlInVariable" style="padding-left: 15px;">
                    <firebot-input input-title="変数名" model="effect.options.variableName" placeholder-text="名前を入力" />
                    <firebot-input style="margin-top: 10px;" input-title="変数の有効期間（TTL）" model="effect.options.variableTtl" input-type="number" disable-variables="true" placeholder-text="秒数を入力（任意）" />
                    <firebot-input style="margin-top: 10px;" input-title="変数のプロパティパス" model="effect.options.variablePropertyPath" input-type="text" disable-variables="true" placeholder-text="任意" />
                </div>
            </div>

            <!--<div style="padding-top:20px">
                <label class="control-fb control--checkbox"> クリップをダウンロード <tooltip text="'クリップの保存先フォルダは設定タブで変更できます。'"></tooltip>
                    <input type="checkbox" ng-model="effect.download">
                    <div class="control__indicator"></div>
                </label>
            </div>-->
        </eos-container>

        <div ng-if="effect.showInOverlay">
            <eos-container header="動画の終了を待つ" class="setting-padtop">
                <firebot-checkbox label="動画の終了を待つ" tooltip="動画の再生が終わるまで、次のエフェクトの実行を待ちます。" model="effect.wait" />
            </eos-container>
            <eos-overlay-position effect="effect"></eos-overlay-position>
            <eos-container header="サイズ">
                <label class="control-fb control--checkbox"> 16:9 の比率を維持
                    <input type="checkbox" ng-click="forceRatioToggle();" ng-checked="forceRatio">
                    <div class="control__indicator"></div>
                </label>
                <div class="input-group">
                    <span class="input-group-addon">幅（px）</span>
                    <input
                        type="text"
                        class="form-control"
                        aria-describeby="video-width-setting-type"
                        type="number"
                        ng-change="calculateSize('Width', effect.width)"
                        ng-model="effect.width">
                    <span class="input-group-addon">高さ（px）</span>
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
                注意: このエフェクトを使用するには配信中である必要があります。
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
        if ($scope.effect.embedColor == null) {
            $scope.effect.embedColor = "#21b9ed";
        }
        if ($scope.effect.wait == null) {
            $scope.effect.wait = true;
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
            .then((channels) => {
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
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.postInDiscord && effect.discordChannelId == null) {
            errors.push("Discord チャンネルを選択してください。");
        }
        if (effect.options.putClipUrlInVariable && !(effect.options.variableName?.length > 0)) {
            errors.push("変数名を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        if (effect.postLink) {
            await TwitchApi.chat.sendChatMessage("Creating clip...", null, true);
        }

        const clip = await TwitchApi.clips.createClip();

        if (clip != null) {
            if (effect.postLink) {
                const message = `Clip created: ${clip.url}`;
                await TwitchApi.chat.sendChatMessage(message, null, true);
            }

            if (effect.postInDiscord) {
                const clipEmbed = await discordEmbedBuilder.buildClipEmbed(clip, effect.embedColor);
                await discord.sendDiscordMessage(effect.discordChannelId, "A new clip was created!", clipEmbed);
            }

            logger.info("Successfully created a clip!");

            const clipDuration = clip.duration;

            if (effect.showInOverlay) {

                const position = mediaProcessor.resolveRandomPosition(effect.position);

                let overlayInstance = null;
                if (SettingsManager.getSetting("UseOverlayInstances")) {
                    if (effect.overlayInstance != null) {
                        if (SettingsManager.getSetting("OverlayInstances").includes(effect.overlayInstance)) {
                            overlayInstance = effect.overlayInstance;
                        }
                    }
                }

                const { url, useIframe } = await resolveTwitchClipVideoUrl(clip);

                webServer.sendToOverlay("playTwitchClip", {
                    clipVideoUrl: url,
                    useIframe,
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

                if (effect.wait ?? true) {
                    await wait(clipDuration * 1000);
                }
            }

            if (effect.options.putClipUrlInVariable) {
                CustomVariableManager.addCustomVariable(
                    effect.options.variableName,
                    clip.url,
                    effect.options.variableTtl || 0,
                    effect.options.variablePropertyPath || null
                );
            }
        } else {
            if (effect.postLink) {
                await TwitchApi.chat.sendChatMessage("Whoops! Something went wrong when creating a clip. :(", null, true);
            }
        }

        return {
            success: clip != null,
            outputs: {
                clipUrl: clip?.url ?? "",
                thumbnailUrl: clip?.thumbnailUrl ?? ""
            }
        };
    },
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "playTwitchClip",
            onOverlayEvent: (event) => {
                const {
                    clipVideoUrl,
                    useIframe,
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
                    exitDuration,
                    rotation
                } = event;

                let videoElement;
                if (useIframe) {

                    const styles = `width: ${width || screen.width}px;
                        height: ${height || screen.height}px;
                        transform: rotate(${rotation || 0});`;

                    videoElement = `
                        <iframe style="border: none; ${styles}"
                            src="${clipVideoUrl}&parent=${window.location.hostname}&autoplay=true"
                            height="${height || screen.height}"
                            width="${width || screen.width}"
                            frameBorder=0
                            allowfullscreen>
                        </iframe>
                    `;
                } else {

                    const styles = (width ? `width: ${width}px;` : '') +
                        (height ? `height: ${height}px;` : '') +
                        (rotation ? `transform: rotate(${rotation});` : '');

                    videoElement = `
                        <video autoplay
                            src="${clipVideoUrl}"
                            height="${height || ""}"
                            width="${width || ""}"
                            style="border: none;${styles}"
                            onloadstart="this.volume=${volume}"
                            allowfullscreen="false" />
                    `;
                }


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
