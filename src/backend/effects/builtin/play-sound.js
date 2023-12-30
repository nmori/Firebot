"use strict";

const { settings } = require("../../common/settings-access");
const resourceTokenManager = require("../../resourceTokenManager");
const webServer = require("../../../server/http-server-manager");
const fs = require('fs/promises');
const logger = require("../../logwrapper");
const path = require("path");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectCategory } = require('../../../shared/effect-constants');
const { wait } = require("../../utility");

const playSound = {
    definition: {
        id: "firebot:playsound",
        name: "サウンドを再生",
        description: "効果音を再生します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
    <eos-container header="Type">
        <firebot-radios
            options="{ local: 'Local file', folderRandom: 'Random from folder', url: 'Url' }"
            model="effect.soundType"
            inline="true"
            style="padding-bottom: 5px;"
        />
    </eos-container>

    <div ng-hide="effect.soundType == null">
        <eos-container header="音源" pad-top="true">
            <div ng-if="effect.soundType === 'folderRandom'">
                <file-chooser model="effect.folder" options="{ directoryOnly: true, filters: [], title: '音源のフォルダを選択'}"></file-chooser>
            </div>

            <div ng-if="effect.soundType === 'local'">
                <div style="margin-bottom: 10px">
                    <file-chooser model="effect.filepath" options="{ filters: [ {name: 'Audio', extensions: ['mp3', 'ogg', 'wav', 'flac']} ]}" on-update="soundFileUpdated(filepath)"></file-chooser>
                </div>
                <div>
                    <sound-player path="effect.filepath" volume="effect.volume" output-device="effect.audioOutputDevice"></sound-player>
                </div>
            </div>

            <div ng-if="effect.soundType === 'url'">
               <firebot-input input-title="Url" model="effect.url" />
            </div>

            <div style="padding-top:20px">
                <label class="control-fb control--checkbox"> Wait for sound to finish <tooltip text="'音が鳴り終わるのを待ってから、次の効果をかける。'"></tooltip>
                    <input type="checkbox" ng-model="effect.waitForSound">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="音量" pad-top="true">
            <div class="volume-slider-wrapper">
                <i class="fal fa-volume-down volume-low"></i>
                <rzslider rz-slider-model="effect.volume" rz-slider-options="{floor: 1, ceil: 10, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                <i class="fal fa-volume-up volume-high"></i>
            </div>
        </eos-container>

        <eos-audio-output-device effect="effect" pad-top="true"></eos-audio-output-device>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
    </div>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.soundType == null) {
            $scope.effect.soundType = "local";
        }

        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }
    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.soundType === "local" || effect.soundType == null) {
            if (effect.filepath == null || effect.filepath.length < 1) {
                errors.push("音源ファイルを指定してください");
            }
        } else if (effect.soundType === "folderRandom") {
            if (effect.folder == null || effect.folder.length < 1) {
                errors.push("音源フォルダを指定してください");
            }
        } else if (effect.soundType === "url" && (effect.url == null || effect.url.trim() === "")) {
            errors.push("URLをいれてください");
        }

        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        if (effect.soundType == null) {
            effect.soundType = "local";
        }

        const data = {
            filepath: effect.filepath,
            url: effect.url,
            isUrl: effect.soundType === "url",
            volume: effect.volume,
            overlayInstance: effect.overlayInstance
        };

        // Get random sound
        if (effect.soundType === "folderRandom") {
            let files = [];
            try {
                files = await fs.readdir(effect.folder);
            } catch (err) {
                logger.warn("Unable to read sound folder", err);
            }

            const filteredFiles = files.filter(i => (/\.(mp3|ogg|wav)$/i).test(i));
            const chosenFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)];

            if (filteredFiles.length === 0) {
                logger.error('No sounds were found in the select sound folder.');
            }

            data.filepath = path.join(effect.folder, chosenFile);
        }

        // Set output device.
        let selectedOutputDevice = effect.audioOutputDevice;
        if (selectedOutputDevice == null || selectedOutputDevice.label === "App Default") {
            selectedOutputDevice = settings.getAudioOutputDevice();
        }
        data.audioOutputDevice = selectedOutputDevice;

        // Generate token if going to overlay, otherwise send to gui.
        if (selectedOutputDevice.deviceId === "overlay") {
            if (effect.soundType !== "url") {
                const resourceToken = resourceTokenManager.storeResourcePath(
                    data.filepath,
                    30
                );
                data.resourceToken = resourceToken;
            }

            // send event to the overlay
            webServer.sendToOverlay("sound", data);
        } else {
            // Send data back to media.js in the gui.
            renderWindow.webContents.send("playsound", data);
        }

        if (effect.waitForSound) {
            try {
                const duration = await frontendCommunicator.fireEventAsync("getSoundDuration", {
                    path: data.isUrl ? data.url : data.filepath
                });
                const durationInMils = (Math.round(duration) || 0) * 1000;
                await wait(durationInMils);
                return true;
            } catch (error) {
                return true;
            }
        }
        return true;
    },
    /**
   * Code to run in the overlay
   */
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "sound",
            onOverlayEvent: event => {
                const data = event;
                const token = encodeURIComponent(data.resourceToken);
                const resourcePath = `http://${
                    window.location.hostname
                }:7472/resource/${token}`;

                // Generate UUID to use as class name.
                // eslint-disable-next-line no-undef
                const uuid = uuidv4();

                const filepath = data.isUrl ? data.url : data.filepath.toLowerCase();
                let mediaType;
                if (filepath.endsWith("mp3")) {
                    mediaType = "audio/mpeg";
                } else if (filepath.endsWith("ogg")) {
                    mediaType = "audio/ogg";
                } else if (filepath.endsWith("wav")) {
                    mediaType = "audio/wav";
                }

                const audioElement = `<audio id="${uuid}" src="${data.isUrl ? data.url : resourcePath}" type="${mediaType}"></audio>`;

                // Throw audio element on page.
                $("#wrapper").append(audioElement);

                const audio = document.getElementById(uuid);
                audio.volume = parseFloat(data.volume) / 10;

                audio.oncanplay = () => audio.play();

                audio.onended = () => {
                    $(`#${uuid}`).remove();
                };
            }
        }
    }
};

module.exports = playSound;
