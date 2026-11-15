"use strict";

/**
 * Enum for community plugin categories.
 * @readonly
 * @enum {string}
 */
const PluginCategory = Object.freeze({
    STREAM_SERVICES: "stream-services",
    SOCIAL: "social",
    MUSIC_AND_MEDIA: "music-media",
    GAMES: "games",
    OVERLAYS: "overlays",
    TOOLS_AND_UTILITIES: "tools-utilities"
});

/**
 * Display labels for community plugin categories.
 * @readonly
 */
const PluginCategoryLabels = Object.freeze({
    [PluginCategory.STREAM_SERVICES]: "配信サービス",
    [PluginCategory.SOCIAL]: "ソーシャル",
    [PluginCategory.MUSIC_AND_MEDIA]: "音楽とメディア",
    [PluginCategory.GAMES]: "ゲーム",
    [PluginCategory.OVERLAYS]: "オーバーレイ",
    [PluginCategory.TOOLS_AND_UTILITIES]: "ツールとユーティリティ"
});

/**
 * Enum for Firebot features a community plugin can provide.
 * @readonly
 * @enum {string}
 */
const PluginFeature = Object.freeze({
    EFFECTS: "effects",
    EVENTS: "events",
    VARIABLES: "variables",
    INTEGRATIONS: "integrations",
    OVERLAY_WIDGETS: "overlay-widgets",
    GAMES: "games",
    COMMANDS: "commands",
    UI_EXTENSIONS: "ui-extensions"
});

/**
 * Display labels for community plugin features.
 * @readonly
 */
const PluginFeatureLabels = Object.freeze({
    [PluginFeature.EFFECTS]: "演出",
    [PluginFeature.EVENTS]: "イベント",
    [PluginFeature.VARIABLES]: "変数",
    [PluginFeature.INTEGRATIONS]: "連携",
    [PluginFeature.OVERLAY_WIDGETS]: "オーバーレイウィジェット",
    [PluginFeature.GAMES]: "ゲーム",
    [PluginFeature.COMMANDS]: "コマンド",
    [PluginFeature.UI_EXTENSIONS]: "UI 拡張"
});

exports.PluginCategory = PluginCategory;
exports.PluginCategoryLabels = PluginCategoryLabels;
exports.PluginFeature = PluginFeature;
exports.PluginFeatureLabels = PluginFeatureLabels;
