"use strict";

(function() {

    angular
        .module("firebotApp")
        .component("pluginSettings", {
            template: `
                <div>

                    <div
                        style="display:flex; align-items:stretch; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px;"
                    >
                        <div
                            ng-style="{ background: isScriptingEnabled() ? '#48a14d' : '#d99211' }"
                            style="width: 5px; flex-shrink: 0;"
                        ></div>
                        <div style="display:flex; align-items:center; padding: 16px 20px; gap: 16px; flex-grow: 1; min-width: 0;">
                            <div
                                ng-style="{ background: isScriptingEnabled() ? 'rgba(72,161,77,0.18)' : 'rgba(217,146,17,0.18)', color: isScriptingEnabled() ? '#48a14d' : '#d99211' }"
                                style="width: 44px; height: 44px; border-radius: 50%; display:flex; align-items:center; justify-content:center; flex-shrink: 0;"
                            >
                                <i
                                    ng-class="isScriptingEnabled() ? 'fas fa-check' : 'fas fa-times'"
                                    style="font-size: 20px;"
                                ></i>
                            </div>
                            <div style="flex-grow: 1; min-width: 0;">
                                <div style="font-weight: 600; font-size: 15px;" ng-if="isScriptingEnabled()">
                                    プラグインとスクリプトは有効です
                                </div>
                                <div style="font-weight: 600; font-size: 15px;" ng-if="!isScriptingEnabled()">
                                    プラグインとスクリプトは無効です
                                </div>
                                <div class="muted" style="font-size: 13px; margin-top: 2px;" ng-if="isScriptingEnabled()">
                                    Firebot は起動時にインストール済みのプラグインを読み込み、「カスタムスクリプトの実行」演出の実行を許可します。
                                </div>
                                <div class="muted" style="font-size: 13px; margin-top: 2px;" ng-if="!isScriptingEnabled()">
                                    インストール済みのプラグインは読み込まれず、「カスタムスクリプトの実行」演出はスキップされます。インストールするスクリプトを信頼できる場合のみ有効にしてください。
                                </div>
                            </div>
                            <div style="flex-shrink: 0;">
                                <firebot-button
                                    ng-if="isScriptingEnabled()"
                                    text="無効化"
                                    type="default"
                                    ng-click="setScriptingEnabled(false)"
                                />
                                <firebot-button
                                    ng-if="!isScriptingEnabled()"
                                    text="有効化"
                                    type="default"
                                    ng-click="setScriptingEnabled(true)"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="muted" style="font-size: 12px; padding: 0 4px 20px;">
                        <p>プラグインは起動時に読み込まれるスクリプトで、新しい演出、変数、イベントなどを登録できます。</p>
                        <p>独自のプラグインを作成したい場合は、<a
                            class="clickable"
                            ng-click="openLink('https://docs.firebot.app/v5/dev/scripts')"
                        >こちら</a>で方法を確認できます。</p>
                    </div>

                    <div ng-if="getPluginsWithPendingUpdates().length > 0" class="mb-12">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px;">
                            <h3 style="margin: 0;">更新可能なプラグイン</h3>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div
                                ng-repeat="plugin in getPluginsWithPendingUpdates() | orderBy:getPluginName track by plugin.config.id"
                                style="display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; min-width: 0;"
                            >
                                <plugin-icon plugin-icon="plugin.details.manifest.icon"></plugin-icon>

                                <div style="flex-grow: 1; min-width: 0;">
                                    <div style="display:flex; align-items:baseline; gap: 8px; flex-wrap: wrap;">
                                        <span style="font-weight: 600; font-size: 15px; word-break: break-word;">
                                            {{getPluginName(plugin)}}
                                        </span>
                                    </div>
                                    <div
                                        class="muted"
                                        style="font-size: 13px; margin-top: 4px; line-height: 1.4; overflow-wrap: anywhere;"
                                        ng-if="plugin.details.manifest.description"
                                    >
                                        インストール済みバージョン: v{{plugin.details.manifest.version}}
                                    </div>
                                    <div
                                        class="muted"
                                        style="font-size: 13px; margin-top: 4px; line-height: 1.4; overflow-wrap: anywhere;"
                                        ng-if="plugin.details.manifest.description"
                                    >
                                        利用可能なバージョン: v{{pendingUpdateDetails(plugin).version}}
                                    </div>
                                </div>

                                <div style="display:flex; align-items:center; gap: 6px; flex-shrink: 0;">
                                    <firebot-button
                                        text="更新をダウンロード"
                                        type="default"
                                        size="small"
                                        disabled="$scope.installingUpdate === true"
                                        ng-if="plugin.isInstallingUpdate !== true"
                                        ng-click="updateCommunityPlugin(plugin)"
                                    />
                                    <firebot-button
                                        text="更新中..."
                                        type="default"
                                        size="small"
                                        disabled="true"
                                        ng-if="plugin.isInstallingUpdate === true"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px;">
                            <h3 style="margin: 0;">インストール済みのプラグイン</h3>
                            <div style="display: flex; gap: 8px;">
                                <firebot-button
                                    text="ファイルからインストール"
                                    type="default"
                                    icon="fa-plus"
                                    ng-click="installPluginFromFile()"
                                    disabled="!settings.getSetting('RunCustomScripts')"
                                />
                                <firebot-button
                                    text="プラグインを探す"
                                    type="primary"
                                    icon="fa-search"
                                    ng-click="showCommunityPluginModal()"
                                    disabled="!settings.getSetting('RunCustomScripts')"
                                />
                            </div>
                        </div>

                        <div ng-if="getPlugins().length === 0" class="muted" style="padding: 30px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; text-align:center;">
                            インストールされているプラグインはありません。<b>プラグインを探す</b> または <b>ファイルからインストール</b> をクリックして追加してください。
                        </div>

                        <div ng-if="getPlugins().length > 0" style="display: flex; flex-direction: column; gap: 10px;">
                            <div
                                ng-repeat="plugin in getPlugins() | orderBy:getPluginName track by plugin.config.id"
                                style="display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; min-width: 0;"
                            >
                                <plugin-icon plugin-icon="plugin.details.manifest.icon"></plugin-icon>

                                <div style="flex-grow: 1; min-width: 0;">
                                    <div style="display:flex; align-items:baseline; gap: 8px; flex-wrap: wrap;">
                                        <span style="font-weight: 600; font-size: 15px; word-break: break-word;">
                                            {{getPluginName(plugin)}}
                                        </span>
                                        <span
                                            class="muted"
                                            style="font-size: 11px; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.06);"
                                            ng-if="plugin.details.manifest.version"
                                        >v{{plugin.details.manifest.version}}</span>
                                        <span
                                            class="muted"
                                            style="font-size: 12px;"
                                            ng-if="plugin.details.manifest.author"
                                        >作者: {{plugin.details.manifest.author}}</span>
                                        <span
                                            ng-if="plugin.config.communityPluginDetails != null"
                                            style="font-size: 11px; padding: 1px 8px; border-radius: 10px; background: rgba(0,208,255,0.18); color: #00d0ff;"
                                        >コミュニティ</span>
                                        <span
                                            ng-if="plugin.config.enabled === false"
                                            style="font-size: 11px; padding: 1px 8px; border-radius: 10px; background: rgba(217,146,17,0.18); color: #d99211;"
                                        >無効</span>
                                    </div>
                                    <div
                                        class="muted"
                                        style="font-size: 13px; margin-top: 4px; line-height: 1.4; overflow-wrap: anywhere;"
                                        ng-if="plugin.details.manifest.description"
                                    >
                                        {{plugin.details.manifest.description}}
                                    </div>
                                    <div
                                        ng-if="hasPluginLinks(plugin)"
                                        style="display:flex; align-items:center; flex-wrap: wrap; gap: 8px; margin-top: 8px;"
                                    >
                                        <a
                                            ng-if="plugin.details.manifest.repo"
                                            class="clickable plugin-link-pill"
                                            ng-click="openLink(plugin.details.manifest.repo)"
                                            uib-tooltip="{{plugin.details.manifest.repo}}"
                                            tooltip-append-to-body="true"
                                        >
                                            <i class="fab fa-github"></i> ソース
                                        </a>
                                        <a
                                            ng-if="plugin.details.manifest.website"
                                            class="clickable plugin-link-pill"
                                            ng-click="openLink(plugin.details.manifest.website)"
                                            uib-tooltip="{{plugin.details.manifest.website}}"
                                            tooltip-append-to-body="true"
                                        >
                                            <i class="fas fa-globe"></i> Webサイト
                                        </a>
                                        <a
                                            ng-if="plugin.details.manifest.support"
                                            class="clickable plugin-link-pill"
                                            ng-click="openLink(plugin.details.manifest.support)"
                                            uib-tooltip="{{plugin.details.manifest.support}}"
                                            tooltip-append-to-body="true"
                                        >
                                            <i class="fas fa-life-ring"></i> サポート
                                        </a>
                                    </div>
                                </div>

                                <div style="display:flex; align-items:center; gap: 6px; flex-shrink: 0;">
                                    <firebot-button
                                        text="設定"
                                        type="default"
                                        size="small"
                                        ng-click="configurePlugin(plugin)"
                                    />
                                    <button
                                        aria-label="プラグインメニューを開く"
                                        class="noselect clickable plugin-card-menu-btn"
                                        context-menu="pluginMenuOptions(plugin)"
                                        context-menu-on="click"
                                        context-menu-class="angular-context-menu"
                                        context-menu-orientation="left"
                                        uib-tooltip="その他のオプション"
                                        tooltip-append-to-body="true"
                                        style="background: transparent; border: none; padding: 4px 10px; font-size: 18px; line-height: 1;"
                                    >
                                        <i class="fal fa-ellipsis-v"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
          `,
            controller: function($rootScope, $scope, settingsService, modalFactory,
                modalService, pluginsService, backendCommunicator, ngToast, $q,
                profileManager
            ) {
                $scope.openLink = $rootScope.openLinkExternally;
                $scope.settings = settingsService;

                $scope.installingUpdate = false;

                pluginsService.loadPlugins();

                $scope.getPluginName = (plugin) => {
                    return plugin.details.manifest.name || plugin.config.fileName;
                };

                $scope.isScriptingEnabled = function() {
                    return !!settingsService.getSetting('RunCustomScripts');
                };

                $scope.setScriptingEnabled = function(enabled) {
                    settingsService.saveSetting('RunCustomScripts', !!enabled);
                };

                $scope.getPlugins = function() {
                    return pluginsService.getInstalledPlugins();
                };

                $scope.getPluginsWithPendingUpdates = function() {
                    return pluginsService.getInstalledPlugins()
                        .filter(p => pluginsService.pendingPluginUpdates[p.config.id] != null);
                };

                $scope.hasPluginLinks = function(plugin) {
                    const manifest = (plugin && plugin.details && plugin.details.manifest) || {};
                    return !!(manifest.repo || manifest.website || manifest.support);
                };

                $scope.pendingUpdateDetails = (plugin) => {
                    return plugin?.config?.communityPluginDetails != null
                        ? pluginsService.pendingPluginUpdates[plugin.config.id]
                        : null;
                };

                $scope.togglePluginEnabled = function(plugin) {
                    const next = !(plugin.config.enabled !== false);
                    plugin.config.enabled = next;
                    pluginsService.setPluginEnabled(plugin.config.id, next);
                };

                $scope.configurePlugin = function(plugin) {
                    modalService.showModal({
                        component: "configurePluginModal",
                        size: "md",
                        resolveObj: {
                            plugin: () => angular.copy(plugin)
                        }
                    });
                };

                $scope.removePlugin = function(plugin) {
                    modalService.showModal({
                        component: "removePluginModal",
                        size: "sm",
                        backdrop: true,
                        keyboard: true,
                        resolveObj: {
                            pluginName: () => plugin.details.manifest.name || plugin.config.fileName,
                            isCommunityPlugin: () => plugin.config.communityPluginDetails != null
                        },
                        closeCallback: (response) => {
                            if (response && response.confirmed) {
                                pluginsService.deletePlugin(plugin.config.id, response.deletePluginFile);
                            }
                        }
                    });
                };

                $scope.openGenerateCommunityManifestModal = (plugin) => {
                    modalService.showModal({
                        component: "generateCommunityPluginManifestModal",
                        size: "lg",
                        resolveObj: {
                            plugin: () => plugin
                        },
                        closeCallback: () => {}
                    });
                };

                $scope.pluginMenuOptions = function(plugin) {
                    const isEnabled = plugin.config.enabled !== false;
                    const isCommunityPlugin = plugin.config.communityPluginDetails != null;

                    const options = [
                        {
                            html: `<a href><i class="far ${isEnabled ? 'fa-toggle-off' : 'fa-toggle-on'}" style="margin-right: 10px;"></i> ${isEnabled ? '無効化' : '有効化'}</a>`,
                            click: () => {
                                $scope.togglePluginEnabled(plugin);
                            }
                        }
                    ];

                    if (isCommunityPlugin !== true) {
                        options.push({
                            html: `<a href><i class="far fa-sync" style="margin-right: 10px;"></i> 更新</a>`,
                            click: () => {
                                $scope.updatePlugin(plugin);
                            }
                        });
                    }

                    options.push({
                        html: `<a href style="color: #d9534f;"><i class="far fa-trash" style="margin-right: 10px;"></i> 削除</a>`,
                        click: () => {
                            $scope.removePlugin(plugin);
                        }
                    });

                    if (isCommunityPlugin !== true) {
                        options.push({
                            text: `開発者ツール`,
                            hasTopDivider: true,
                            children: [
                                {
                                    html: `<a href><i class="far fa-brackets-curly" style="margin-right: 10px;"></i>  コミュニティマニフェストを生成</a>`,
                                    click: () => {
                                        $scope.openGenerateCommunityManifestModal(plugin);
                                    }
                                }
                            ]
                        });
                    }

                    return options;
                };

                function doInstall(filePath, overwrite) {
                    return $q.when(pluginsService.installPluginFromFile(filePath, overwrite))
                        .then((result) => {
                            if (!result) {
                                ngToast.create("プラグインのインストールに失敗しました。");
                                return;
                            }
                            if (result.conflict) {
                                modalFactory.showConfirmationModal({
                                    title: "プラグインファイルは既に存在します",
                                    question: `${result.error} 上書きしますか？`,
                                    confirmLabel: "上書き",
                                    confirmBtnType: "btn-warning"
                                }).then((confirmed) => {
                                    if (confirmed) {
                                        doInstall(filePath, true);
                                    }
                                });
                                return;
                            }
                            if (result.success === false) {
                                modalFactory.showErrorModal(result.error || "プラグインのインストールに失敗しました。");
                                return;
                            }

                            const pluginName = $scope.getPluginName(result.installedPlugin);
                            ngToast.create({
                                className: "success",
                                content: `${pluginName} プラグインをインストールしました！`
                            });

                            if (!!result.installedPlugin.details.parametersSchema?.length) {
                                $scope.configurePlugin(result.installedPlugin);
                            }
                        });
                }

                $scope.installPluginFromFile = function() {
                    $q.when(backendCommunicator.fireEventAsync("open-file-browser", {
                        currentPath: profileManager.getPathInProfile("/scripts"),
                        options: {
                            title: "プラグインを選択",
                            buttonLabel: "選択",
                            filters: [{ name: "JavaScript", extensions: ["js"] }]
                        }
                    })).then((response) => {
                        if (!response || !response.path) {
                            return;
                        }
                        doInstall(response.path, false);
                    });
                };

                $scope.showCommunityPluginModal = () => {
                    modalService.showModal({
                        component: "communityPluginBrowserModal",
                        size: "lg"
                    });
                };

                function doUpdate(plugin, filePath, overwrite) {
                    return $q.when(pluginsService.updatePluginFromFile(plugin.config.id, filePath, overwrite))
                        .then((result) => {
                            if (!result) {
                                ngToast.create("プラグインの更新に失敗しました。");
                                return;
                            }
                            if (result.conflict) {
                                modalFactory.showConfirmationModal({
                                    title: "プラグインファイルは既に存在します",
                                    question: `${result.error} 上書きしますか？`,
                                    confirmLabel: "上書き",
                                    confirmBtnType: "btn-warning"
                                }).then((confirmed) => {
                                    if (confirmed) {
                                        doUpdate(plugin, filePath, true);
                                    }
                                });
                                return;
                            }
                            if (result.success === false) {
                                modalFactory.showErrorModal(result.error || "プラグインの更新に失敗しました。");
                                return;
                            }
                            pluginsService.loadPlugins();
                            ngToast.create({
                                className: "success",
                                content: `プラグイン「${plugin.details && plugin.details.name ? plugin.details.name : plugin.config.fileName}」を更新しました。`
                            });
                        });
                }

                $scope.updatePlugin = function(plugin) {
                    if (!plugin || !plugin.config) {
                        return;
                    }
                    $q.when(backendCommunicator.fireEventAsync("open-file-browser", {
                        currentPath: profileManager.getPathInProfile("/scripts"),
                        options: {
                            title: "新しいプラグインを選択",
                            buttonLabel: "選択",
                            filters: [{ name: "JavaScript", extensions: ["js"] }]
                        }
                    })).then((response) => {
                        if (!response || !response.path) {
                            return;
                        }
                        doUpdate(plugin, response.path, false);
                    });
                };

                $scope.updateCommunityPlugin = async (plugin) => {
                    if (!plugin?.config) {
                        return;
                    }

                    const pluginUpdate = pluginsService.pendingPluginUpdates[plugin.config.id];
                    if (!pluginUpdate) {
                        return;
                    }

                    $scope.installingUpdate = true;
                    plugin.isInstallingUpdate = true;

                    const result = await pluginsService.updateCommunityPlugin(plugin.config.id);

                    plugin.isInstallingUpdate = false;
                    $scope.installingUpdate = false;

                    if (result.success !== true) {
                        ngToast.create({
                            className: "warn",
                            content: `プラグインの更新に失敗しました (${result.error})。詳細はログを確認してください。`
                        });
                        return;
                    }

                    ngToast.create({
                        className: "success",
                        content: `${plugin.details.manifest.name} プラグインを v${pluginUpdate.version} に更新しました`
                    });
                };
            }
        });
}());
