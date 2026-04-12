"use strict";
const EventEmitter = require("events");
const logger = require("../../../logwrapper");
const hueManager = require("./hue-manager");
const nodeApi = require('node-hue-api'),
    discovery = nodeApi.discovery,
    hueApi = nodeApi.api;

const appName = 'Firebot';
const deviceName = 'Firebot-Hue';

const { EffectManager } = require("../../../effects/effect-manager");
const frontendCommunicator = require("../../../common/frontend-communicator");

const integrationDefinition = {
    id: "hue",
    name: "Philips Hue",
    description: "Philips Hue専用エフェクトを実行できます。Hueブリッジのリンクボタンを押した後、Firebot側でリンクを実行してください。",
    linkType: "other",
    connectionToggle: false
};

async function connectToHue(hueUser) {
    const connection = await hueManager.connectHueBridge(hueUser);

    if (connection) {
        return true;
    }

    frontendCommunicator.send(
        "error",
        "Hueに接続できませんでした。ブリッジのIPアドレス変更、またはユーザー情報消失の可能性があります。Hueを再リンクしてください。"
    );
    return false;
}

class HueIntegration extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
    }
    init(linked, integrationData) {

        EffectManager.registerEffect(require("./effects/hue-scenes"));
        EffectManager.registerEffect(require("./effects/control-light"));

        if (linked) {
            if (integrationData && integrationData.settings && integrationData.settings.user) {
                connectToHue(integrationData.settings.user);
            }
        }
    }
    disconnect() {
        this.emit("disconnected", integrationDefinition.id);
    }
    async link() {
        const settings = {};

        const hueUser = await this.discoverAndCreateUser();

        if (hueUser !== false) {
            settings.user = hueUser;

            this.emit("settings-update", integrationDefinition.id, settings);

            connectToHue(hueUser);
            return;
        }

        frontendCommunicator.send(
            "error",
            "Hueブリッジのリンクボタンを押してから、Firebotでリンクボタンをクリックしてください。"
        );
        throw new Error("Hueブリッジのリンクボタンを押してから、Firebotでリンクボタンをクリックしてください。");
    }
    async unlink() {
        await hueManager.deleteHueUser();
    }
    async discoverBridge() {
        logger.info('Attempting to discover Hue Bridges via mDNS');
        let discoveryResults = await discovery.mdnsSearch();

        if (discoveryResults.length === 0) {
            logger.warn('Failed to resolve any Hue Bridges via MDNS');
            logger.info('Attempting to discover Hue Bridges via N-UPnP');
            discoveryResults = await discovery.nupnpSearch();
        }

        if (discoveryResults.length === 0) {
            logger.error('Failed to resolve any Hue Bridges via N-UPnP');
            return null;
        }
        // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
        return discoveryResults[0].ipaddress;
    }
    async discoverAndCreateUser() {
        const ipAddress = await this.discoverBridge();

        if (ipAddress == null) {
            logger.warn('Failed to discover any Hue Bridges');
            return false;
        }

        // Create an unauthenticated instance of the Hue API so that we can create a new user
        const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect();
        let createdUser;
        try {
            createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
            createdUser.ipAddress = ipAddress;
            return createdUser;
        } catch (err) {
            if (err.getHueErrorType() === 101) {
                logger.warn('The Link button on the bridge was not pressed. Please press the Link button and try again.');
            } else {
                logger.error(`Unexpected Error: ${err.message}`);
            }

            return false;
        }
    }
}

module.exports = {
    definition: integrationDefinition,
    integration: new HueIntegration()
};
