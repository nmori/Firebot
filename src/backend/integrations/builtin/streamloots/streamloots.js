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
    description: "チェスト購入／カード交換イベント",
    connectionToggle: true,
    linkType: "id",
    idDetails: {
        steps:
`1. [StreamLoots](https://www.streamloots.com/)にログインします.

2. ダッシュボードで、**ページ設定**の下にある**アラート**セクションに向かいます。

3. アラートの設定**セクションで、**Click here to show URL**というグレーアウトした枠をクリックします。

4. アラートURLの**末尾**にある値をコピーしてください。URLの形式は: \`https://widgets.streamloots.com/alerts/<ID>\``
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
