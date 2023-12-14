"use strict";

const { settings } = require("../../common/settings-access");
const resourceTokenManager = require("../../resourceTokenManager");
const webServer = require("../../../server/http-server-manager");
const fs = require('fs-extra');
const logger = require("../../logwrapper");
const path = require("path");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectCategory } = require('../../../shared/effect-constants');
const { wait } = require("../../utility");
const axiosDefault = require("axios").default;

const axios = axiosDefault.create({
    headers: {
        'User-Agent': 'Firebot v5 - VOICEVOX'
    }
});

axios.interceptors.request.use(request => {
    //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
    return request;
});

axios.interceptors.response.use(response => {
    //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
    return response;
});

const voicelists = [];

const playSound = {
    definition: {
        id: "firebot:playvoicevox",
        name: "VOICEVOXで読み上げ",
        description: "VOICEVOXをつかって合成音声を読み上げ",
        icon: "fad fa-waveform",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="キャスト">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="voicecast-name">{{effect.voicecast ? effect.voicecast.name : '選択...'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu voicecast-name-dropdown">
                <li ng-repeat="voicelist in effect.voicelists""
                    ng-click="effect.voicecast = voicelist">
                    <a href>{{voicelist.name}}</a>
                </li>
            </ul>
        </div>
    </eos-container>        

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>
        <eos-container header="音源" pad-top="true">
            <div style="padding-top:20px">

                <label class="control-fb control--checkbox"> 再生終了を待つ <tooltip text="'音が鳴り終わるのを待ってから、次の効果に移ります'"></tooltip>
                    <input type="checkbox" ng-model="effect.waitForSound">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>
        
        <eos-container header="パラメータ" pad-top="true">

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
        
    `,
    optionsController: async($scope) =>  {

        if ($scope.effect.volume == null) {
            $scope.effect.volume = 5;
        }     
        if ($scope.effect.voicevoxPort == null) {
            $scope.effect.voicevoxPort = 50021;
        }       
        if ($scope.effect.voicelists == null) {
            $scope.effect.voicelists = [];
        }    
        try {       
            const axiosDefault = require("axios").default;

            const axios = axiosDefault.create({

            });

            axios.interceptors.request.use(request => {
                //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
                return request;
            });

            axios.interceptors.response.use(response => {
                //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
                return response;
            });
            const response = await axios({
                method:'get',
                url: 'http://127.0.0.1:'+String($scope.effect.voicevoxPort)+'/speakers' 
            });
            for (const voicecast of response.data) 
            {
                for (const voicestyle of voicecast.styles) 
                {
                    $scope.effect.voicelists.push( { name:voicecast.name+'-'+voicestyle.name , id:voicestyle.id});
                }    
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.voicecast == null || effect.voicecast.id ==="") {
            errors.push("キャストを指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;
        const tmp = require('tmp');
        effect.soundType = "url";
        var tmpWaveFile = tmp.fileSync({ postfix: '.wav' });
        try {
            // HTTP header
            var headers = {
                'Content-Type': 'application/json'
            };
            
            const response = await axios({
                method:'post',
                url: 'http://127.0.0.1:'+String(effect.voicevoxPort)+'/audio_query?text='+encodeURIComponent(effect.message)+'&speaker='+String(effect.voicecast.id),
                headers: headers,
                data: null
            });
            
            var headers_wave = {
                'Content-Type': 'application/json',
                "accept": "audio/wav",
            };
            const response_voice = await axios({
                method:'post',
                url: 'http://127.0.0.1:'+String(effect.voicevoxPort)+'/synthesis?speaker='+String(effect.voicecast.id),
                headers: headers_wave,
                data: response.data,
                responseType : 'arraybuffer' 
            });
            try {
                fs.writeFileSync(tmpWaveFile.name, response_voice.data, 'binary');                
            } catch (err) {
                console.error('Error writing to temporary file:', err);
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        const data = {
            filepath: tmpWaveFile.name,
            url: '',
            isUrl: false,
            volume: effect.volume,
            overlayInstance: effect.overlayInstance
        };

        // Set output device.
        let selectedOutputDevice = effect.audioOutputDevice;
        if (selectedOutputDevice == null || selectedOutputDevice.deviceId === "") {
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
                tmpWaveFile.setGracefulCleanup();
                return true;
            } catch (error) {
                return true;
            }
        }else{
            try {
                const duration = await frontendCommunicator.fireEventAsync("getSoundDuration", {
                    path: data.isUrl ? data.url : data.filepath
                });
                const durationInMils = (Math.round(duration) || 0) * 1000;
                setTimeout(() => {
                    tmpWaveFile.setGracefulCleanup();
                 }, durationInMils+10000);
                
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
                    $("#" + uuid).remove();
                };
            }
        }
    }
};

module.exports = playSound;
