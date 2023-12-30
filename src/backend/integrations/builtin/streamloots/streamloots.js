"use strict";
const logger = require("../../../logwrapper");
const EventEmitter = require("events");
const EventSource = require("eventsource");
const slootsEventHandler = require("./streamloots-event-handler");
const slootsVariableLoader = require("./variables/streamloots-variable-loader");
const slootsFilterLoader = require("./filters/streamloots-filter-loader");

const integrationDefinition = {
    id: "streamloots",
    name: "StreamLoots",
    description: "�`�F�X�g�w���^�J�[�h�����C�x���g",
    connectionToggle: true,
    linkType: "id",
    idDetails: {
        steps:
`1. [StreamLoots](https://www.streamloots.com/)�Ƀ��O�C�����܂�.

2. �_�b�V���{�[�h�ŁA**�y�[�W�ݒ�**�̉��ɂ���**�A���[�g**�Z�N�V�����Ɍ������܂��B

3. �A���[�g�̐ݒ�**�Z�N�V�����ŁA**Click here to show URL**�Ƃ����O���[�A�E�g�����g���N���b�N���܂��B

4. �A���[�gURL��**����**�ɂ���l���R�s�[���Ă��������BURL�̌`����: \`https://widgets.streamloots.com/alerts/<ID>\``
    }
};

class StreamLootsIntegration extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
        this._eventSource = null;
    }
    init() {
        slootsEventHandler.registerEvents();
        slootsVariableLoader.registerVariables();
        slootsFilterLoader.registerFilters();
    }
    connect(integrationData) {
        let { accountId } = integrationData;

        if (accountId == null) {
            this.emit("disconnected", integrationDefinition.id);
            this.connected = false;
            return;
        }

        accountId = accountId.replace("https://widgets.streamloots.com/alerts/", "").replace("/media-stream", "");

        this._eventSource = new EventSource(`https://widgets.streamloots.com/alerts/${accountId}/media-stream`, {
            rejectUnauthorized: false
        });

        this._eventSource.onmessage = (event) => {
            if (event.data) {
                const parsedData = JSON.parse(event.data);
                slootsEventHandler.processStreamLootsEvent(parsedData);
            }
        };

        this._eventSource.onerror = function(err) {
            logger.error("Streamloots eventsource failed:", err);
            this.disconnect();
            return;
        };

        this.emit("connected", integrationDefinition.id);
        this.connected = true;

    }
    disconnect() {
        if (this._eventSource) {
            this._eventSource.close();
            this.connected = false;
        }

        this.emit("disconnected", integrationDefinition.id);
    }
    link() {
    }
    unlink() {
        if (this._eventSource) {
            this._eventSource.close();
            this.connected = false;
            this.emit("disconnected", integrationDefinition.id);
        }
    }
}

const integration = new StreamLootsIntegration();

module.exports = {
    definition: integrationDefinition,
    integration: integration
};
