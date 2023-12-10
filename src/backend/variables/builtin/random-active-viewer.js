// Migration: todo - Need implementation details

"use strict";
const util = require("../../utility");
const logger = require("../../logwrapper");
const activeUserHandler = require('../../chat/chat-listeners/active-user-handler');
const customRoleManager = require('../../roles/custom-roles-manager');

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "randomActiveViewer",
        usage: "randomActiveViewer",
        description: "ランダムにアクティブなおしゃべりをする。",
        examples: [
            {
                usage: "randomActiveViewer[roleName]",
                description: "特定の役割のアクティブな視聴者へのフィルター."
            },
            {
                usage: "randomActiveViewer[null, ignoreUser]",
                description: "無視ユーザーではないランダムなアクティブユーザーを取得する。"
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, roleName, ignoreUser) => {
        logger.debug("Getting random active viewer...");

        const activeViewerCount = activeUserHandler.getActiveUserCount();

        if (activeViewerCount === 0) {
            return "[ランダムアクティブユーザーを取得できない]";
        }

        if (ignoreUser != null) {
            const randomViewer = activeUserHandler.getRandomActiveUser(ignoreUser);
            return randomViewer ? randomViewer.username : "[ランダムアクティブユーザーを取得できない]";
        }

        if (roleName != null) {
            const customRole = customRoleManager.getRoleByName(roleName);
            if (customRole == null) {
                return "[ランダムアクティブユーザーを取得できない]";
            }

            const customRoleUsers = customRole.viewers;
            if (customRoleUsers.length === 0) {
                return "[ランダムなアクティブユーザー、役割を取得できない]";
            }

            const usersWithRole = activeUserHandler.getAllActiveUsers().filter(user => customRoleUsers.includes(user.username));
            if (usersWithRole.length === 0) {
                return "[ランダムアクティブユーザーを取得できない]";
            }
            const randIndex = util.getRandomInt(0, usersWithRole.length - 1);
            return usersWithRole[randIndex].username;
        }

        if (activeViewerCount > 0) {
            const randomViewer = activeUserHandler.getRandomActiveUser();
            return randomViewer ? randomViewer.username : "[ランダムアクティブユーザーを取得できない]";
        }

        return "[ランダムアクティブユーザーを取得できない]";
    }
};

module.exports = model;
