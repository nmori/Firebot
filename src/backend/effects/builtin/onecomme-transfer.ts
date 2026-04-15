import { createHash, randomUUID } from "node:crypto";
import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

type SlotName = {
    id: string;
    name: string;
};

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
        const { effect } = event;

        try {
            const hash = createHash("sha1");
            hash.update(effect.writerName);

            const sendData = {
                service: {
                    id: String(effect.slotname.id),
                    name: effect.slotname.name,
                    write: true,
                    speech: true,
                    persist: true
                },
                comment: {
                    id: randomUUID(),
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

            await fetch("http://localhost:11180/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sendData)
            });
        } catch (error) {
            logger.error("Error running http request", (error as Error).message);
        }

        return true;
    }
};

export = model;
