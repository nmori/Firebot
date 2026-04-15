import moment from "moment";
import NodeCache from "node-cache";

import type { SystemCommand } from "../../../../types/commands";

import { CommandManager } from "../../../chat/commands/command-manager";
import { GameManager } from "../../game-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import currencyManager from "../../../currency/currency-manager";
import logger from "../../../logwrapper";
import { humanizeTime } from "../../../utils";
import webServer from "../../../../server/http-server-manager";
import { drawFukubiki, clearPrizeStocks, type FukubikiPrize } from "./fukubiki-machine";

const cooldownCache = new NodeCache({ checkperiod: 5 });
/** ユーザーごとの累積引き回数 */
const drawCountCache = new NodeCache({ checkperiod: 60 });
/** 処理中フラグ（二重実行防止） */
const processingCache = new NodeCache({ checkperiod: 2 });

const FUKUBIKI_COMMAND_ID = "firebot:fukubiki";

/**
 * 設定から賞リストを取得する（配列として直接格納）。
 */
function getPrizes(settings: ReturnType<typeof GameManager.getGameSettings>): FukubikiPrize[] {
    const prizes = settings.settings.fukubikiSettings.prizes;
    if (!Array.isArray(prizes)) {
        return [];
    }
    return (prizes as FukubikiPrize[]).filter(
        (p) =>
            typeof p.name === "string" &&
            typeof p.chance === "number" &&
            typeof p.stock === "number" &&
            typeof p.message === "string"
    );
}

const fukubikiCommand: SystemCommand = {
    definition: {
        id: FUKUBIKI_COMMAND_ID,
        name: "福引き",
        active: true,
        trigger: "!fukubiki",
        description: "福引きをします",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: []
    },
    onTriggerEvent: async ({ userCommand, chatMessage }) => {
        const settings = GameManager.getGameSettings("firebot-fukubiki");
        const chatter = settings.settings.chatSettings.chatter as string;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";

        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;

        // --- 二重実行防止 ---
        if (processingCache.get(username)) {
            return;
        }
        processingCache.set(username, true, 10);

        try {
            await handleFukubiki(settings, username, displayName, chatMessage.id, sendAsBot);
        } finally {
            processingCache.del(username);
        }
    }
};

async function handleFukubiki(
    settings: ReturnType<typeof GameManager.getGameSettings>,
    username: string,
    displayName: string,
    messageId: string,
    sendAsBot: boolean
): Promise<void> {
    const wagerAmount = (settings.settings.currencySettings.defaultWager as number) || 0;
    const currencyId = settings.settings.currencySettings.currencyId as string;
    const maxDraws = (settings.settings.fukubikiSettings.maxDrawsPerUser as number) ?? 0;
    const prizes = getPrizes(settings);

    // --- 一人当たりの回数チェック ---
    if (maxDraws > 0) {
        const drawCountRaw = drawCountCache.get(username);
        const drawCount = typeof drawCountRaw === "number" ? drawCountRaw : 0;
        if (drawCount >= maxDraws) {
            const maxDrawsMsg = settings.settings.generalMessages.maxDrawsReached as string;
            if (maxDrawsMsg) {
                const msg = maxDrawsMsg
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName)
                    .replaceAll("{maxDraws}", String(maxDraws));
                await TwitchApi.chat.sendChatMessage(msg, messageId, sendAsBot);
            }
            return;
        }
    }

    // --- クールダウンチェック ---
    const cooldownExpireTime = cooldownCache.get(username);
    if (cooldownExpireTime && moment().isBefore(cooldownExpireTime as moment.Moment)) {
        const onCooldownMsg = settings.settings.generalMessages.onCooldown as string;
        if (onCooldownMsg) {
            const timeRemainingDisplay = humanizeTime(
                Math.abs(moment().diff(cooldownExpireTime as moment.Moment, "seconds"))
            );
            const msg = onCooldownMsg
                .replaceAll("{username}", username)
                .replaceAll("{timeRemaining}", timeRemainingDisplay)
                .replaceAll("{displayName}", displayName);
            await TwitchApi.chat.sendChatMessage(msg, messageId, sendAsBot);
        }
        return;
    }

    // --- 賞が空の場合 ---
    if (prizes.length === 0) {
        await TwitchApi.chat.sendChatMessage("福引きの設定に問題があります。管理者にご連絡ください。", messageId, sendAsBot);
        return;
    }

    // --- 残高チェック ---
    let userBalance: number;
    try {
        userBalance = await currencyManager.getViewerCurrencyAmount(username, currencyId);
    } catch (error) {
        logger.error(error);
        userBalance = 0;
    }

    if (userBalance < wagerAmount) {
        const notEnoughMsg = settings.settings.generalMessages.notEnough as string;
        if (notEnoughMsg) {
            const msg = notEnoughMsg
                .replaceAll("{username}", username)
                .replaceAll("{displayName}", displayName);
            await TwitchApi.chat.sendChatMessage(msg, messageId, sendAsBot);
        }
        return;
    }

    // --- クールダウン設定 ---
    const cooldownSecs = settings.settings.cooldownSettings.cooldown as number;
    if (cooldownSecs && cooldownSecs > 0) {
        const expireTime = moment().add(cooldownSecs, "seconds");
        cooldownCache.set(username, expireTime, cooldownSecs);
    }

    // --- 通貨消費 ---
    if (wagerAmount > 0) {
        try {
            await currencyManager.adjustCurrencyForViewer(username, currencyId, 0 - Math.abs(wagerAmount));
        } catch (error) {
            logger.error(error);
            await TwitchApi.chat.sendChatMessage(
                `${displayName}さん、通貨処理にエラーが発生したため福引きはキャンセルされました。`,
                messageId,
                sendAsBot
            );
            return;
        }
    }

    // --- 引き回数カウント ---
    const currentCountRaw = drawCountCache.get(username);
    const currentCount: number = typeof currentCountRaw === "number" ? currentCountRaw : 0;
    drawCountCache.set(username, currentCount + 1);

    // --- 抽選 ---
    const winner = drawFukubiki(prizes);

    if (winner == null) {
        // ストック切れ等で賞がない場合
        await TwitchApi.chat.sendChatMessage(
            `${displayName}さん、申し訳ありませんが現在有効な賞がありません。`,
            messageId,
            sendAsBot
        );
        // 通貨を返還
        if (wagerAmount > 0) {
            try {
                await currencyManager.adjustCurrencyForViewer(username, currencyId, Math.abs(wagerAmount));
            } catch (refundError) {
                logger.error(refundError);
            }
        }
        return;
    }

    // --- 結果をダイレクトチャット（リプライ）で送信 ---
    const resultMsg = winner.message
        .replaceAll("{username}", username)
        .replaceAll("{displayName}", displayName)
        .replaceAll("{prizeName}", winner.name);

    await TwitchApi.chat.sendChatMessage(resultMsg, messageId, sendAsBot);

    // --- オーバーレイ表示 ---
    const useOverlay = settings.settings.overlaySettings?.useOverlay as boolean;
    if (useOverlay) {
        const overlayDuration = (settings.settings.overlaySettings?.overlayDuration as number) ?? 5;
        const fontSize = (settings.settings.overlaySettings?.fontSize as number) ?? 36;
        const fontColor = (settings.settings.overlaySettings?.fontColor as string) ?? "#FFFFFF";
        const overlayInstance = (settings.settings.overlaySettings?.overlayInstance as string) ?? null;
        const overlayText = `${displayName} → ${winner.name}`;

        webServer.sendToOverlay(
            "overlayalert",
            {
                mediaType: "none",
                text: overlayText,
                font: {
                    family: "Open Sans",
                    size: fontSize,
                    color: fontColor,
                    weight: 700,
                    italic: false
                },
                textShadow: true,
                duration: overlayDuration,
                textPosition: "below",
                enterAnimation: "fadeIn",
                enterDuration: 0.5,
                exitAnimation: "fadeOut",
                exitDuration: 0.5
            },
            overlayInstance
        );
    }
}

function registerFukubikiCommand(): void {
    if (!CommandManager.hasSystemCommand(FUKUBIKI_COMMAND_ID)) {
        CommandManager.registerSystemCommand(fukubikiCommand);
    }
}

function unregisterFukubikiCommand(): void {
    CommandManager.unregisterSystemCommand(FUKUBIKI_COMMAND_ID);
}

function purgeCaches(): void {
    cooldownCache.flushAll();
    drawCountCache.flushAll();
    processingCache.flushAll();
    clearPrizeStocks();
}

export default {
    purgeCaches,
    registerFukubikiCommand,
    unregisterFukubikiCommand
};
