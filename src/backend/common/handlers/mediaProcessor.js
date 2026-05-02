"use strict";

const { SettingsManager } = require("../settings-manager");
const { ResourceTokenManager } = require("../../resource-token-manager");
const { getRandomInt } = require("../../utils");
const logger = require("../../logwrapper");
const { ReplaceVariableManager } = require("../../variables/replace-variable-manager");
const webServer = require("../../../server/http-server-manager");

function getRandomPresetLocation() {
    const presetPositions = [
        "Top Left",
        "Top Middle",
        "Top Right",
        "Middle Left",
        "Middle",
        "Middle Right",
        "Bottom Left",
        "Bottom Middle",
        "Bottom Right"
    ];

    const randomIndex = getRandomInt(0, presetPositions.length - 1);
    return presetPositions[randomIndex];
}

const RANDOM_X_ROWS = ["Top Random", "Middle Random", "Bottom Random"];
const RANDOM_Y_COLS = ["Random Left", "Random Middle", "Random Right"];

// 連続値（リニア）抽選用の position 値。プリセット9値ではなく、オーバーレイ側でピクセル単位の
// 位置を毎回ランダム計算する。バックエンドではそのまま透過する（オーバーレイのビューポートサイズに
// 依存するため、抽選は overlay 側で実施する）。
const RANDOM_LINEAR_POSITIONS = [
    "Random Linear",
    "Top Random Linear",
    "Middle Random Linear",
    "Bottom Random Linear",
    "Random Left Linear",
    "Random Middle Linear",
    "Random Right Linear"
];

// 「Top Middle」のように Y 行 + X 列 の合成名称に整える。Middle/Middle は短縮表記の "Middle"。
function combinePresetPosition(yRow, xCol) {
    if (yRow === "Middle" && xCol === "Middle") {
        return "Middle";
    }
    return `${yRow} ${xCol}`;
}

function isRandomLinearPosition(position) {
    return RANDOM_LINEAR_POSITIONS.includes(position);
}

// 与えられた position を、必要に応じて抽選してプリセット9値の1つに正規化する。
// 既存の "Random"（両軸）に加え、"Top Random" 等（X軸のみ）と "Random Left" 等（Y軸のみ）に対応。
// "* Linear" は連続値抽選なので overlay 側に委ね、ここではそのまま返す。
function resolveRandomPosition(position) {
    if (isRandomLinearPosition(position)) {
        return position;
    }
    if (position === "Random") {
        return getRandomPresetLocation();
    }
    if (RANDOM_X_ROWS.includes(position)) {
        const yRow = position.split(" ")[0]; // "Top" | "Middle" | "Bottom"
        const xCols = ["Left", "Middle", "Right"];
        const xCol = xCols[getRandomInt(0, xCols.length - 1)];
        return combinePresetPosition(yRow, xCol);
    }
    if (RANDOM_Y_COLS.includes(position)) {
        const xCol = position.split(" ")[1]; // "Left" | "Middle" | "Right"
        const yRows = ["Top", "Middle", "Bottom"];
        const yRow = yRows[getRandomInt(0, yRows.length - 1)];
        return combinePresetPosition(yRow, xCol);
    }
    return position;
}

// Image Processor
async function imageProcessor(effect, trigger) {

    logger.debug("processing image effect...");

    // Send data back to media.js in the gui.

    const position = resolveRandomPosition(effect.position);

    const data = {
        "filepath": effect.file,
        "url": effect.url,
        "imageType": effect.imageType,
        "imagePosition": position,
        "imageHeight": effect.height,
        "imageWidth": effect.width,
        "imageDuration": effect.length,
        "enterAnimation": effect.enterAnimation,
        "exitAnimation": effect.exitAnimation,
        "enterDuration": effect.enterDuration,
        "exitDuration": effect.exitDuration,
        "inbetweenAnimation": effect.inbetweenAnimation,
        "inbetweenDelay": effect.inbetweenDelay,
        "inbetweenDuration": effect.inbetweenDuration,
        "inbetweenRepeat": effect.inbetweenRepeat,
        "customCoords": effect.customCoords
    };

    if (SettingsManager.getSetting("UseOverlayInstances")) {
        if (effect.overlayInstance != null) {
            if (SettingsManager.getSetting("OverlayInstances").includes(effect.overlayInstance)) {
                data.overlayInstance = effect.overlayInstance;
            }
        }
    }

    if (effect.imageType == null) {
        effect.imageType = "local";
    }

    if (effect.imageType === "local") {
        const resourceToken = ResourceTokenManager.storeResourcePath(
            effect.file,
            effect.length
        );
        data.resourceToken = resourceToken;
    } else {
        logger.debug("Populating show image effect url with variables");
        data.url = await ReplaceVariableManager.populateStringWithTriggerData(data.url, trigger);
    }

    webServer.sendToOverlay("image", data);
}

// Video Processor
function videoProcessor(effect) {
    const position = resolveRandomPosition(effect.position);

    // Send data back to media.js in the gui.
    const data = {
        "videoType": effect.videoType,
        "filepath": effect.file,
        "youtubeId": effect.youtube,
        "videoPosition": position,
        "videoHeight": effect.height,
        "videoWidth": effect.width,
        "videoDuration": effect.length,
        "videoVolume": effect.volume,
        "videoStarttime": effect.starttime,
        "enterAnimation": effect.enterAnimation,
        "exitAnimation": effect.exitAnimation,
        "enterDuration": effect.enterDuration,
        "exitDuration": effect.exitDuration,
        inbetweenAnimation: effect.inbetweenAnimation,
        inbetweenDelay: effect.inbetweenDelay,
        inbetweenDuration: effect.inbetweenDuration,
        "inbetweenRepeat": effect.inbetweenRepeat,
        "customCoords": effect.customCoords,
        "loop": effect.loop === true
    };

    if (SettingsManager.getSetting("UseOverlayInstances")) {
        if (effect.overlayInstance != null) {
            if (SettingsManager.getSetting("OverlayInstances").includes(effect.overlayInstance)) {
                data.overlayInstance = effect.overlayInstance;
            }
        }
    }

    const resourceToken = ResourceTokenManager.storeResourcePath(
        effect.file,
        effect.length
    );
    data.resourceToken = resourceToken;

    webServer.sendToOverlay("video", data);
}

// Display Text Processor
async function showText(effect, trigger) {
    //data transfer object
    const dto = {
        text: effect.text,
        enterAnimation: effect.enterAnimation,
        exitAnimation: effect.exitAnimation,
        enterDuration: effect.enterDuration,
        exitDuration: effect.exitDuration,
        inbetweenAnimation: effect.inbetweenAnimation,
        inbetweenDelay: effect.inbetweenDelay,
        inbetweenDuration: effect.inbetweenDuration,
        inbetweenRepeat: effect.inbetweenRepeat,
        customCoords: effect.customCoords,
        position: effect.position,
        duration: effect.duration,
        height: effect.height,
        width: effect.width,
        justify: effect.justify,
        dontWrap: effect.dontWrap,
        overlayInstance: effect.overlayInstance
    };

    logger.debug("Populating show text effect text with variables");
    dto.text = await ReplaceVariableManager.populateStringWithTriggerData(dto.text, trigger);

    const resolvedPosition = resolveRandomPosition(dto.position);
    if (resolvedPosition !== dto.position) {
        logger.debug("Getting random preset location");
        dto.position = resolvedPosition;
    }

    if (SettingsManager.getSetting("UseOverlayInstances")) {
        if (dto.overlayInstance != null) {
            //reset overlay if it doesnt exist
            if (!SettingsManager.getSetting("OverlayInstances").includes(dto.overlayInstance)) {
                dto.overlayInstance = null;
            }
        }
    }

    // Ensure defaults
    if (dto.duration <= 0) {
        logger.debug("Effect duration is less tha 0, resetting duration to 5 sec");
        dto.duration = 5;
    }

    if (dto.height == null || dto.height < 1) {
        logger.debug("Setting default height");
        dto.height = 200;
    }

    if (dto.width == null || dto.width < 1) {
        logger.debug("Setting default width");
        dto.width = 400;
    }

    if (dto.position === "" || dto.position == null) {
        logger.debug("Setting default overlay position");
        dto.position = "Middle";
    }

    if (dto.justify == null) {
        dto.justify = "center";
    }

    if (dto.dontWrap == null) {
        dto.dontWrap = false;
    }

    webServer.sendToOverlay("text", dto);
}

// Export Functions
exports.image = imageProcessor;
exports.video = videoProcessor;
exports.text = showText;
exports.randomLocation = getRandomPresetLocation;
exports.resolveRandomPosition = resolveRandomPosition;
exports.isRandomLinearPosition = isRandomLinearPosition;
exports.RANDOM_LINEAR_POSITIONS = RANDOM_LINEAR_POSITIONS;