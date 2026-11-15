"use strict";

(function() {

    angular
        .module("firebotApp")
        .factory("pluginsService", function(backendCommunicator, modalFactory, $q) {
            const service = {};

            let installedPlugins = [];
            service.pendingFrontendReload = false;
            service.pendingPluginUpdates = {};

            backendCommunicator.on("plugin-manager:all-plugins", (plugins) => {
                installedPlugins = Array.isArray(plugins) ? plugins : [];
            });

            backendCommunicator.on("plugin-manager:community-plugin-updates", (updates) => {
                service.pendingPluginUpdates = updates ?? {};
            });

            service.loadPlugins = function() {
                backendCommunicator.send("plugin-manager:ui-service-ready");
            };

            service.getInstalledPlugins = function() {
                return installedPlugins;
            };

            service.getPluginById = function(id) {
                return installedPlugins.find(p => p.config && p.config.id === id);
            };

            service.savePluginConfig = async (pluginConfig) => {
                if (!pluginConfig || !pluginConfig.id) {
                    return;
                }

                return await backendCommunicator.fireEventAsync("plugin-manager:save-config", { pluginConfig });
            };

            service.deletePlugin = function(pluginId, deletePluginFile = false) {
                if (!pluginId) {
                    return;
                }

                backendCommunicator.send("plugin-manager:delete", {
                    id: pluginId,
                    deletePluginFile: deletePluginFile === true
                });
            };

            service.setPluginEnabled = function(pluginId, enabled) {
                if (!pluginId) {
                    return;
                }

                backendCommunicator.send("plugin-manager:set-enabled", {
                    id: pluginId,
                    enabled: enabled === true
                });
            };

            /**
             * Validate + copy a .js file from disk into the user's scripts folder
             */
            service.installPluginFromFile = function(filePath, overwrite = false) {
                return $q.when(
                    backendCommunicator.fireEventAsync("plugin-manager:install-from-file", {
                        filePath,
                        overwrite: overwrite === true
                    })
                );
            };

            service.updatePluginFromFile = function(pluginId, filePath, overwrite = false) {
                return $q.when(
                    backendCommunicator.fireEventAsync("plugin-manager:update-from-file", {
                        pluginId,
                        filePath,
                        overwrite: overwrite === true
                    })
                );
            };

            service.searchCommunityPlugins = async (criteria) => {
                return await backendCommunicator.fireEventAsync("plugin-manager:search-community-plugins", criteria);
            };

            service.installCommunityPlugin = async (pluginDetails) => {
                return await backendCommunicator.fireEventAsync("plugin-manager:install-community-plugin", pluginDetails);
            };

            service.updateCommunityPlugin = async (pluginId) => {
                return await backendCommunicator.fireEventAsync("plugin-manager:update-community-plugin", pluginId);
            };

            service.getScriptDetails = function(fileName, expectedScriptType) {
                return $q.when(
                    backendCommunicator.fireEventAsync("plugin-manager:get-plugin-details", { fileName, expectedScriptType })
                );
            };

            backendCommunicator.onAsync("plugin-manager:prompt-frontend-reload",
                async (data) => {
                    // Only show the reload prompt once. There's an indicator.
                    if (service.pendingFrontendReload !== true) {
                        modalFactory.showConfirmationModal({
                            title: "再読み込みが必要です",
                            question: `${data.pluginName} プラグインの更新・無効化・アンインストールを完全に反映するには、Firebot のメインウィンドウを再読み込みする必要があります。今すぐ再読み込みしますか？`,
                            tip: "注意: Firebot は引き続き動作しますが、現在開いているウィンドウ内の未保存の変更は失われます。",
                            cancelLabel: "いいえ、再読み込みしない",
                            cancelBtnType: "btn-default",
                            confirmLabel: "はい、今すぐ再読み込み"
                        }).then((confirmed) => {
                            if (confirmed) {
                                backendCommunicator.send("reload-main-window");
                            } else {
                                service.pendingFrontendReload = true;
                            }
                        });
                    }
                }
            );

            backendCommunicator.send("plugin-manager:ui-service-ready");

            return service;
        });
}());
