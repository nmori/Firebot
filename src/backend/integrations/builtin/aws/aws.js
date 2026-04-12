"use strict";
const EventEmitter = require("events");

const { EffectManager } = require("../../../effects/effect-manager");

const integrationDefinition = {
    id: "aws",
    name: "AWS",
    description: "Amazon Web Services と連携します。",
    linkType: "none",
    connectionToggle: false,
    configurable: true,
    settingCategories: {
        iamCredentials: {
            title: "IAM認証情報",
            sortRank: 1,
            settings: {
                accessKeyId: {
                    title: "アクセスキーID",
                    description: "IAM ユーザーまたはロールに紐づく AWS アクセスキーを指定します。",
                    type: "string",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                secretAccessKey: {
                    title: "シークレットアクセスキー",
                    description: "アクセスキーに対応するシークレットキーを指定します。",
                    type: "string",
                    showBottomHr: true,
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
                region: {
                    title: "リージョン",
                    description: "連携に使用する AWS リージョンを指定します。",
                    type: "string",
                    default: "us-east-1",
                    tip: "既定値は 'us-east-1' です。",
                    sortRank: 3,
                    validation: {
                        required: true
                    }
                }
            }
        }
    }
};

class AwsIntegration extends EventEmitter {
    constructor() {
        super();
    }
    init() {
        EffectManager.registerEffect(require('./text-to-speech-polly-effect'));
    }
}

module.exports = {
    definition: integrationDefinition,
    integration: new AwsIntegration()
};
