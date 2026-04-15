import dgram from "dgram";
import type { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import logger from "../../logwrapper";

type OscArgType = "s" | "i" | "f" | "T" | "F";

type OscArgument = {
    type: OscArgType;
    value: string;
};

function padTo4(buf: Buffer): Buffer {
    const rem = buf.length % 4;
    return rem === 0 ? buf : Buffer.concat([buf, Buffer.alloc(4 - rem)]);
}

function encodeOscString(str: string): Buffer {
    return padTo4(Buffer.from(`${str}\0`, "utf8"));
}

function encodeOscInt32(val: number): Buffer {
    const b = Buffer.alloc(4);
    b.writeInt32BE(val, 0);
    return b;
}

function encodeOscFloat32(val: number): Buffer {
    const b = Buffer.alloc(4);
    b.writeFloatBE(val, 0);
    return b;
}

function buildOscMessage(address: string, args: OscArgument[]): Buffer {
    const parts: Buffer[] = [encodeOscString(address)];

    let typeTags = ",";
    for (const a of args) {
        typeTags += a.type;
    }
    parts.push(encodeOscString(typeTags));

    for (const a of args) {
        if (a.type === "s") {
            parts.push(encodeOscString(a.value));
        } else if (a.type === "i") {
            parts.push(encodeOscInt32(Math.trunc(Number(a.value))));
        } else if (a.type === "f") {
            parts.push(encodeOscFloat32(Number(a.value)));
        }
        // T / F はデータバイトなし
    }

    return Buffer.concat(parts);
}

const model: EffectType<{
    host: string;
    port: number;
    address: string;
    args: OscArgument[];
}> = {
    definition: {
        id: "firebot:send-osc",
        name: "OSC データを送信する",
        description: "指定したホストへ OSC (Open Sound Control) メッセージを UDP で送信します",
        icon: "fad fa-satellite-dish",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="送信先" pad-top="true">
            <div class="form-group" style="display:flex; gap:16px;">
                <div style="flex:1;">
                    <label class="control-label">ホスト / IP アドレス</label>
                    <input type="text" class="form-control" ng-model="effect.host"
                        placeholder="127.0.0.1" replace-variables />
                </div>
                <div style="width:130px;">
                    <label class="control-label">ポート</label>
                    <input type="number" class="form-control" ng-model="effect.port"
                        placeholder="9000" min="1" max="65535" />
                </div>
            </div>
        </eos-container>

        <eos-container header="OSC アドレス" pad-top="true">
            <input type="text" class="form-control" ng-model="effect.address"
                placeholder="/chatbox/input" replace-variables />
            <p class="help-block muted">スラッシュで始まるパス（例: /chatbox/input）</p>
        </eos-container>

        <eos-container header="引数" pad-top="true">
            <div ng-repeat="arg in effect.args track by $index"
                style="display:flex; gap:8px; margin-bottom:6px; align-items:center;">
                <select class="form-control" ng-model="arg.type" style="width:90px;">
                    <option value="s">文字列</option>
                    <option value="i">整数</option>
                    <option value="f">小数</option>
                    <option value="T">true</option>
                    <option value="F">false</option>
                </select>
                <input ng-if="arg.type !== 'T' && arg.type !== 'F'"
                    type="text" class="form-control" ng-model="arg.value"
                    placeholder="値" replace-variables />
                <span ng-if="arg.type === 'T' || arg.type === 'F'"
                    class="muted" style="flex:1;">（値なし）</span>
                <button class="btn btn-danger btn-sm" ng-click="removeArg($index)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <button class="btn btn-default btn-sm" ng-click="addArg()">
                <i class="fas fa-plus"></i> 引数を追加
            </button>
            <p class="help-block muted" style="margin-top:8px;">
                VRChat チャットボックス例: アドレス <code>/chatbox/input</code>、
                引数: 文字列（メッセージ）、true（即時送信）
            </p>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.host == null) {
            $scope.effect.host = "127.0.0.1";
        }
        if ($scope.effect.port == null) {
            $scope.effect.port = 9000;
        }
        if (!$scope.effect.address) {
            $scope.effect.address = "/chatbox/input";
        }
        if (!$scope.effect.args) {
            $scope.effect.args = [];
        }

        $scope.addArg = () => {
            $scope.effect.args.push({ type: "s", value: "" });
        };
        $scope.removeArg = (index: number) => {
            $scope.effect.args.splice(index, 1);
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.address || !effect.address.startsWith("/")) {
            errors.push("OSC アドレスは / で始まる必要があります");
        }
        if (effect.port == null || effect.port < 1 || effect.port > 65535) {
            errors.push("有効なポート番号（1〜65535）を指定してください");
        }
        return errors;
    },
    onTriggerEvent: ({ effect }) => {
        return new Promise((resolve) => {
            try {
                const message = buildOscMessage(
                    effect.address,
                    (effect.args ?? [])
                );
                const client = dgram.createSocket("udp4");
                client.send(message, effect.port, effect.host || "127.0.0.1", (err) => {
                    client.close();
                    if (err) {
                        logger.error("OSC 送信エラー", err.message);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            } catch (error) {
                logger.error("OSC メッセージ構築エラー", (error as Error).message);
                resolve(false);
            }
        });
    }
};

export = model;
