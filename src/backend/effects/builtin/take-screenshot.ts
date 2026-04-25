import type { EffectType } from "../../../types/effects";
import type { CustomEmbed } from "../../../types/discord";

import { takeScreenshot } from "../../app-management/electron/screen-helpers";
import {
    sendEmbedToDiscord,
    saveScreenshotToFile,
    saveScreenshotToFolder,
    sendScreenshotToDiscord,
    sendScreenshotToOverlay,
    type ScreenshotEffectData
} from "../../common/screenshot-helpers";

const effect: EffectType<{
    displayId: number;
    saveLocally: boolean;
    overwriteExisting: boolean;
    postInDiscord: boolean;
    showInOverlay: boolean;
    folderPath: string;
    file: string;
    discordChannelId: string;
    embedType: unknown;
    embedColor: string;
    fileNamePattern: string;
    message: string;
    customEmbed: CustomEmbed;
    width: number;
    height: number;
    position: string;
    overlayInstance: string;
    duration: number;
}, ScreenshotEffectData & {
    screenshotDataUrl: string;
}> = {
    definition: {
        id: "firebot:screenshot",
        name: "スクリーンショット撮影",
        description: "選択した画面のスクリーンショットを撮影します。",
        icon: "fad fa-camera",
        categories: ["fun"],
        dependencies: [],
        outputs: [
            {
                label: "スクリーンショットデータURL",
                description: "スクリーンショットの base64 データURL。",
                defaultName: "screenshotDataUrl"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="ディスプレイ">
            <dropdown-select options="displayOptions" selected="effect.displayId"></dropdown-select>
        </eos-container>

        <screenshot-effect-options effect="effect"></screenshot-effect-options>

        <eos-container pad-top="true">
            <div class="effect-info alert alert-info">
                注意: スクリーンショットは選択したディスプレイ全体をキャプチャします。
            </div>
        </eos-container>
    `,
    optionsController: ($scope, backendCommunicator) => {
        const displays = backendCommunicator.fireEventSync("getAllDisplays") as Electron.Display[];
        const primaryDisplay = backendCommunicator.fireEventSync("getPrimaryDisplay") as Electron.Display;

        $scope.displayOptions = displays.reduce((acc, display, i) => {
            const isPrimary = display.id === primaryDisplay.id;
            acc[display.id] = `ディスプレイ ${i + 1}${isPrimary ? `（プライマリ）` : ''}`;
            return acc;
        }, {});

        if ($scope.effect.displayId == null ||
            $scope.displayOptions[$scope.effect.displayId] == null) {
            $scope.effect.displayId = displays[0].id;
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        const rgbRegexp = /^#?[0-9a-f]{6}$/ig;
        if (!(effect.saveLocally || effect.overwriteExisting || effect.postInDiscord || effect.showInOverlay)) {
            errors.push("出力先を1つ以上選択してください。");
        }
        if (effect.saveLocally && !effect.folderPath) {
            errors.push("保存先フォルダを選択してください。");
        }
        if (effect.overwriteExisting && !effect.file) {
            errors.push("上書き対象のファイルを選択してください。");
        }
        if (effect.postInDiscord && !effect.discordChannelId) {
            errors.push("Discord チャンネルを選択してください。");
        }
        if (effect.postInDiscord && effect.embedType && !rgbRegexp.test(effect.embedColor)) {
            errors.push("Discord 埋め込みの色は RGB 形式（例: #0066FF）で指定してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        const screenshotDataUrl = await takeScreenshot(effect.displayId);

        if (screenshotDataUrl != null) {

            const base64ImageData = screenshotDataUrl.split(';base64,').pop();
            if (effect.saveLocally) {
                await saveScreenshotToFolder(base64ImageData, effect.folderPath, effect.fileNamePattern);
            }

            if (effect.overwriteExisting) {
                await saveScreenshotToFile(base64ImageData, effect.file);
            }

            if (effect.postInDiscord) {
                switch (effect.embedType) {
                    case "channel":
                    case "custom":
                        await sendEmbedToDiscord(base64ImageData, effect.embedType, effect.message, effect.customEmbed, effect.discordChannelId, effect.embedColor);
                        break;
                    case "stream":
                    case undefined:
                        await sendScreenshotToDiscord(base64ImageData, effect.message, effect.discordChannelId, effect.embedColor);
                        break;
                }
            }

            if (effect.showInOverlay) {
                sendScreenshotToOverlay(screenshotDataUrl, effect);
            }
        }

        return {
            success: screenshotDataUrl != null,
            outputs: {
                screenshotDataUrl: screenshotDataUrl != null ? screenshotDataUrl : ""
            }
        };
    },
    overlayExtension: {
        dependencies: {
            css: [],
            js: []
        },
        event: {
            name: "showScreenshot",
            onOverlayEvent: (event) => {
                const {
                    screenshotDataUrl,
                    width,
                    height,
                    duration,
                    position,
                    customCoords,
                    enterAnimation,
                    enterDuration,
                    inbetweenAnimation,
                    inbetweenDuration,
                    inbetweenDelay,
                    inbetweenRepeat,
                    exitAnimation,
                    exitDuration,
                    rotation
                } = event;

                const styles = (width ? `width: ${width}px;` : '') +
                    (height ? `height: ${height}px;` : '') +
                    (rotation ? `transform: rotate(${rotation});` : "");

                const imageElement = `<img src="${screenshotDataUrl}" style="${styles}">`;

                const positionData = {
                    position: position,
                    customCoords: customCoords
                };

                const animationData = {
                    enterAnimation: enterAnimation,
                    enterDuration: enterDuration,
                    inbetweenAnimation: inbetweenAnimation,
                    inbetweenDelay: inbetweenDelay,
                    inbetweenDuration: inbetweenDuration,
                    inbetweenRepeat: inbetweenRepeat,
                    exitAnimation: exitAnimation,
                    exitDuration: exitDuration,
                    totalDuration: parseFloat(duration.toString()) * 1000
                };

                showElement(imageElement, positionData, animationData);
            }
        }
    }
};

export = effect;