"use strict";
const EventEmitter = require("events");

const effectManager = require("../../../effects/effectManager");

const integrationDefinition = {
    id: "aws",
    name: "AWS",
    description: "アマゾン・ウェブ・サービスと連携する",
    linkType: "none",
    connectionToggle: false,
    configurable: true,
    settingCategories: {
        iamCredentials: {
            title: "IAM 資格情報",
            sortRank: 1,
            settings: {
                accessKeyId: {
                    title: "アクセスキー",
                    description: "IAM ユーザーまたはロールに関連付けられた AWS アクセスキーを指定します",
                    type: "string",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                secretAccessKey: {
                    title: "シークレットキー",
                    description: "アクセスキーに関連付けられたシークレットキーを指定する。",
                    type: "string",
                    showBottomHr: true,
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
                region: {
                    title: "リージョン",
                    description: "サービスのためにやりとりするAWSリージョン（地域）。",
                    type: "string",
                    default: "ap-northeast-1",
                    tip: "初期設定は 'ap-northeast-1' です.",
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
        effectManager.registerEffect(require('./text-to-speech-polly-effect'));
    }
}

module.exports = {
    definition: integrationDefinition,
    integration: new AwsIntegration()
};
