"use strict";

(function() {
    //const { PluginCategory, PluginCategoryLabels, PluginFeature, PluginFeatureLabels } = require("../../shared/plugin-constants");

    angular
        .module("firebotApp")
        .component("generateCommunityPluginManifestModal", {
            template: `
                <div class="modal-header sticky-header" style="border-bottom: 2px solid rgb(128 128 128 / 0.33);">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">コミュニティマニフェストの生成</h4>
                </div>

                <div class="modal-body mx-4 my-8">
                    <h2>{{$ctrl.plugin.details.manifest.name}}</h2>

                    <p>このツールは、<a href="https://github.com/crowbartools/firebot-plugins">Firebot コミュニティプラグインリポジトリ</a>に投稿できるコミュニティプラグインマニフェストの生成を支援します。</p>

                    <div class="effect-info alert alert-warning">
                        注意: このツールは、コミュニティプラグインリポジトリにマニフェストを投稿する予定のプラグイン開発者のみを対象としています。
                        このプラグインの作者でない場合や、公開する予定がない場合は、このツールを使用する必要はありません。
                    </div>

                    <div ng-if="$ctrl.isValidPlugin === true">
                        <div class="form-group">
                            <h4 class="control-label">プラグインのカテゴリー</h4>

                            <firebot-select
                                options="$ctrl.availableCategories"
                                selected="$ctrl.category"
                                style="margin-bottom: 5px;"
                                on-update="$ctrl.generateManifest()"
                            />
                        </div>

                        <div class="form-group">
                            <h4 class="control-label">機能</h4>

                            <multiselect-list
                                model="$ctrl.features"
                                options="$ctrl.availableFeatures"
                                settings="{ options: $ctrl.availableFeatures }"
                                on-update="$ctrl.generateManifest()"
                            />
                        </div>

                        <div class="form-group">
                            <h4 class="control-label">タグ</h4>

                            <editable-tags
                                model="$ctrl.tags"
                                settings="$ctrl.tagOptions"
                                on-update="$ctrl.generateManifest()"
                            ></editable-tags>
                        </div>

                        <div class="form-group">
                            <h4 class="control-label">直接ダウンロード URL</h4>

                            <firebot-input
                                placeholder-text="URL を入力"
                                disable-variables="true"
                                model="$ctrl.downloadUrl"
                                on-input-update="$ctrl.generateManifest()"
                            />
                        </div>

                        <div class="form-group">
                            <h4 class="control-label">リリース日</h4>

                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control ng-animate-disabled"
                                    ng-model="$ctrl.releaseDate"
                                    ng-change="$ctrl.generateManifest()"
                                    disable-variable-menu="true"
                                    uib-datepicker-popup="yyyy-MM-dd"
                                    is-open="$ctrl.showReleaseDatePicker"
                                    datepicker-options="$ctrl.dateOptions"
                                    show-button-bar="false"
                                />
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" ng-click="$ctrl.showReleaseDatePicker = true"><i class="fas fa-calendar"></i></button>
                                </span>
                            </div>
                        </div>

                        <h3 class="mt-8">推奨マニフェストパス</h3>
                        <p>
                            これはコミュニティプラグインマニフェストの推奨ファイルパスです。
                            コミュニティプラグインマニフェストを作成・投稿する際にこのパス名をそのまま使う必要はありませんが、使用するファイルパスは<a href="https://github.com/crowbartools/firebot-plugins/blob/main/CONTRIBUTING.md">コミュニティプラグインの投稿ガイドライン</a>に記載された命名規則に従う必要があります。
                        </p>
                        <div class="px-8 py-4" style="font-family: monospace; background-color: #0003">
                            {{$ctrl.suggestedManifestPath}}
                        </div>

                        <h3 class="mt-8">コミュニティプラグインマニフェスト</h3>
                        <p>
                            投稿する<strong>前に</strong>、このマニフェストを十分に確認してください。
                            マニフェストは<a href="https://github.com/crowbartools/firebot-plugins/blob/main/CONTRIBUTING.md">コミュニティプラグインの投稿ガイドライン</a>に完全に従っている必要があります。
                            また、承認されてマージされた後は<strong>編集できません</strong>。
                        </p>

                        <firebot-button
                            text="マニフェストをクリップボードにコピー"
                            icon="far fa-copy"
                            type="primary"
                            ng-click="$ctrl.copyManifest()"
                        />

                        <div
                            ui-codemirror="{onLoad : $ctrl.codemirrorLoaded}"
                            ui-codemirror-opts="$ctrl.codemirrorSettings"
                            ng-model="$ctrl.generatedManifest"
                            class="mt-4"
                        ></div>
                    </div>

                    <div ng-if="$ctrl.isValidPlugin !== true" class="text-center mx-12">
                        このツールでは、選択したプラグインのコミュニティプラグインマニフェストを自動生成できません。
                        {{$ctrl.validationFailureMessage}}
                        有効なプラグインマニフェストデータの詳細については、<a href="https://github.com/crowbartools/firebot-plugins/blob/main/CONTRIBUTING.md">コミュニティプラグインの投稿ガイドライン</a>を確認してください。
                    </div>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($rootScope, backendCommunicator) {
                const $ctrl = this;

                $ctrl.availableCategories = {
                    "stream-services": "配信サービス",
                    "social": "ソーシャル",
                    "music-media": "音楽とメディア",
                    "games": "ゲーム",
                    "overlays": "オーバーレイ",
                    "tools-utilities": "ツールとユーティリティ"
                };

                $ctrl.availableFeatures = [
                    { id: "effects", name: "演出" },
                    { id: "events", name: "イベント" },
                    { id: "variables", name: "変数" },
                    { id: "integrations", name: "連携" },
                    { id: "overlay-widgets", name: "オーバーレイウィジェット" },
                    { id: "games", name: "ゲーム" },
                    { id: "commands", name: "コマンド" },
                    { id: "ui-extensions", name: "UI 拡張" }
                ];

                $ctrl.tagOptions = {
                    useTextArea: false,
                    addLabel: "タグを追加",
                    editLabel: "タグを編集",
                    validationText: "タグは空にできません",
                    noDuplicates: true
                };

                $ctrl.plugin = null;
                $ctrl.isValidPlugin = true;
                $ctrl.validationFailureMessage = "";

                $ctrl.downloadUrl = "";
                $ctrl.releaseDate = new Date();
                $ctrl.category = "";
                $ctrl.features = [];
                $ctrl.tags = [];

                $ctrl.dateOptions = {
                    showWeeks: false
                };

                $ctrl.showReleaseDatePicker = false;

                $ctrl.suggestedManifestPath = "";

                $ctrl.codemirrorSettings = {
                    mode: { name: "javascript", json: true },
                    theme: "blackboard",
                    lineNumbers: true,
                    autoRefresh: true,
                    showGutter: true,
                    readOnly: true
                };

                $ctrl.codemirrorLoaded = function(_editor) {
                    _editor.refresh();
                    const cmResize = require("cm-resize");
                    cmResize(_editor, {
                        minHeight: 400,
                        resizableWidth: false,
                        resizableHeight: true
                    });
                };

                $ctrl.getSafePathName = (item) => {
                    return (item ?? "")
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9]+/g, "-")
                        .replaceAll(/^-+|-+$/g, "");
                };

                $ctrl.generateManifest = async () => {
                    $ctrl.isValidPlugin = true;
                    $ctrl.validationFailureMessage = "";

                    const safeAuthorName = $ctrl.getSafePathName($ctrl.plugin.details.manifest.author);
                    const safePluginName = $ctrl.getSafePathName($ctrl.plugin.details.manifest.name);

                    let safeVersion = null;
                    const semverRegex = /^((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
                    const regexResult = semverRegex.exec($ctrl.plugin.details.manifest.version);
                    if (regexResult != null && regexResult.length > 1) {
                        safeVersion = regexResult[1];
                    } else {
                        $ctrl.isValidPlugin = false;
                        $ctrl.validationFailureMessage = "プラグインのバージョン文字列が無効です。";
                        return;
                    }

                    if (safeVersion !== $ctrl.plugin.details.manifest.version) {
                        $ctrl.isValidPlugin = false;
                        $ctrl.validationFailureMessage = "プレビュー版のプラグインはサポートされていません。";
                        return;
                    }

                    $ctrl.suggestedManifestPath = `manifests/${safeAuthorName}/${safePluginName}/${safeVersion}/manifest.json`;

                    const sha256 = await backendCommunicator.fireEventAsync("plugin-manager:get-plugin-hash", $ctrl.plugin.config.id);

                    $ctrl.generatedManifest = JSON.stringify({
                        name: $ctrl.plugin.details.manifest.name,
                        author: $ctrl.plugin.details.manifest.author,
                        description: $ctrl.plugin.details.manifest.description,
                        version: $ctrl.plugin.details.manifest.version,
                        downloadUrl: $ctrl.downloadUrl ?? "",
                        sha256: sha256,
                        releaseDate: $ctrl.releaseDate,
                        type: "single-file",

                        icon: $ctrl.plugin.details.manifest.icon,
                        category: $ctrl.category,
                        features: $ctrl.features ?? [],
                        tags: $ctrl.tags ?? [],
                        repo: $ctrl.plugin.details.manifest.repo,
                        website: $ctrl.plugin.details.manifest.website,
                        support: $ctrl.plugin.details.manifest.support,
                        minimumFirebotVersion: $ctrl.plugin.details.manifest.minimumFirebotVersion,
                        maximumFirebotVersion: $ctrl.plugin.details.manifest.maximumFirebotVersion
                    }, null, 4);
                };

                $ctrl.copyManifest = () => {
                    $rootScope.copyTextToClipboard($ctrl.generatedManifest, { show: true, message: "コミュニティマニフェストをクリップボードにコピーしました" });
                };

                $ctrl.$onInit = () => {
                    $ctrl.plugin = $ctrl.resolve.plugin ?? {
                        details: {
                            manifest: {}
                        }
                    };

                    $ctrl.generateManifest();
                };
            }
        });
}());