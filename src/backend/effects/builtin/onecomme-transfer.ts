import { createHash, randomUUID } from "node:crypto";
import NodeCache from "node-cache";
import type { EffectType } from "../../../types/effects";
import type { Trigger } from "../../../types/triggers";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";
import { getEventIdFromTriggerData } from "../../utils";

type SlotName = {
    id: string;
    name: string;
};

// Holds the ids of comments we just sent so the same source event can't be
// forwarded to OneComme twice. Only a few seconds are needed: every known
// duplication path (multiple event settings running in parallel, chat-message
// and viewer-arrived firing off the same chat line) happens within milliseconds.
const recentCommentCache = new NodeCache({ stdTTL: 5, checkperiod: 2 });

/**
 * Finds an id that identifies the single real-world occurrence this effect run
 * came from, so that two runs of the same occurrence produce the same comment id.
 *
 * Note we deliberately look at the metadata rather than switching on
 * `trigger.type`: preset effect lists keep the original metadata and only swap
 * the type out for `preset`, so switching on the type would lose the id.
 *
 * @returns An origin key, or `undefined` if this trigger has no stable id
 */
function getOriginKey(trigger: Trigger): string | undefined {
    const meta = trigger?.metadata;
    if (meta == null) {
        return undefined;
    }

    const messageId = (meta.eventData?.messageId as string)
        ?? meta.eventData?.chatMessage?.id
        ?? meta.chatMessage?.id;
    if (messageId) {
        return `msg:${messageId}`;
    }

    const redemptionId = meta.redemptionId as string;
    if (redemptionId) {
        return `redemption:${redemptionId}`;
    }

    return undefined;
}

/**
 * Formats a hash as a UUID-shaped string, so we keep sending OneComme the same
 * shape of comment id that `randomUUID()` used to produce.
 */
function buildCommentId(originKey: string, contentKey: string): string {
    const hex = createHash("sha1").update(`${originKey}|${contentKey}`).digest("hex");
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
    ].join("-");
}

const model: EffectType<{
    slotname: SlotName;
    slotnames: SlotName[];
    writerName: string;
    message: string;
}> = {
    definition: {
        id: "firebot:onecomme-transfer",
        name: "わんコメに転送",
        description: "指定した文章をわんコメに転送します",
        icon: "fad fa-paw",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="転送先">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="slotname-name">{{effect.slotname ? effect.slotname.name : '選択...'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu slotname-name-dropdown">
                    <li ng-repeat="slotname in effect.slotnames"
                        ng-click="effect.slotname = slotname">
                        <a href>{{slotname.name}}</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container header="書き込み者名" pad-top="true">
            <textarea ng-model="effect.writerName" class="form-control" name="text" placeholder="名前の入力" rows="1" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>
    `,
    optionsController: async ($scope) => {
        $scope.effect.slotnames = [];

        try {
            const response = await fetch("http://127.0.0.1:11180/api/services", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const responseData: Array<{ id: string; name: string }> = JSON.parse(await response.text());
            for (const slotname of responseData) {
                $scope.effect.slotnames.push({ name: slotname.name, id: slotname.id });
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.slotname == null) {
            errors.push("転送先を指定してください");
        }
        if (effect.writerName == null || effect.writerName === "") {
            errors.push("名前を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect, trigger } = event;

        try {
            const hash = createHash("sha1");
            hash.update(effect.writerName);

            // When we can tell which real-world occurrence this run came from, derive
            // the comment id from it instead of using a random one. Two runs of the
            // same occurrence then produce the same id, which lets us drop the second
            // one below and lets OneComme collapse anything that still gets through.
            const originKey = getOriginKey(trigger);
            const contentKey = `${effect.slotname?.id}|${effect.writerName}|${effect.message}`;
            const commentId = originKey != null
                ? buildCommentId(originKey, contentKey)
                : randomUUID();

            const logContext = `slot=${effect.slotname?.name}(${effect.slotname?.id}) writer=${effect.writerName} `
                + `id=${commentId} origin=${originKey ?? "none"} trigger=${trigger?.type} `
                + `event=${getEventIdFromTriggerData(trigger) ?? "none"} effectId=${effect.id}`;

            // The check and the set must stay in the same synchronous block: events-router
            // runs every matching event setting in parallel via Promise.all, so an await
            // in between would let both runs get past the check.
            if (originKey != null) {
                if (recentCommentCache.get(commentId)) {
                    logger.warn(`[onecomme-transfer] 重複送信を検出したためスキップしました ${logContext}`);
                    return true;
                }
                recentCommentCache.set(commentId, true);
            }

            logger.debug(`[onecomme-transfer] わんコメに転送します ${logContext} message=${effect.message?.slice(0, 80)}`);

            const sendData = {
                service: {
                    id: String(effect.slotname.id),
                    name: effect.slotname.name,
                    write: true,
                    //speech: true,
                    //persist: true
                },
                comment: {
                    id: commentId,
                    userId: hash.digest("hex"),
                    name: effect.writerName,
                    badges: [],
                    profileImage: "",
                    comment: effect.message,
                    hasGift: false,
                    isOwner: false,
                    timestamp: 0
                }
            };

            const response = await fetch("http://localhost:11180/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sendData)
            });

            if (!response.ok) {
                logger.warn(`[onecomme-transfer] わんコメへの送信に失敗しました status=${response.status} ${response.statusText} ${logContext}`);
            }
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
