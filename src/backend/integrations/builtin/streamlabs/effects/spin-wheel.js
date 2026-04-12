"use strict";

const { EffectCategory } = require("../../../../../shared/effect-constants");
const integrationManager = require("../../../integration-manager");
const axios = require("axios").default;
const logger = require("../../../../logwrapper");

const effect = {
    definition: {
        id: "streamlabs:spin-wheel",
        name: "スピンホイール",
        description: "StreamLabの \"スピンホイール\" を起動",
        icon: "fad fa-tire",
        categories: [EffectCategory.INTEGRATIONS],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-info">
            これにより、StreamLabのの「スピンホイール」機能が作動します。
            </div>
        </eos-container>
    `,
    optionsController: () => { },
    optionsValidator: () => {
    },
    onTriggerEvent: async () => {
        const streamlabs = integrationManager.getIntegrationDefinitionById("streamlabs");
        const accessToken = streamlabs.auth && streamlabs.auth["access_token"];

        if (accessToken) {
            try {
<<<<<<< HEAD
                await axios.post("https://streamlabs.com/api/v1.0/wheel/spin",
=======
                const response = await fetch("https://streamlabs.com/api/v2.0/wheel/spin",
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
                    {
                        "access_token": accessToken
                    });

                return true;
            } catch (error) {
                logger.error("Failed to spin Streamlabs wheel", error.message);
                return false;
            }
        }
    }
};

module.exports = effect;
