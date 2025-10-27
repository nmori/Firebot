import type { ReplaceVariable } from "../../../../../types/variables";
import { AccountAccess } from "../../../../common/account-access";
import { TwitchApi } from "../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "categoryImageUrl",
        usage: "categoryImageUrl",
        description: "最後に配信されたカテゴリの画像のURLを取得します。",
        examples: [
            {
                usage: "categoryImageUrl[$target]",
                description: "コマンドの場合、ターゲットチャンネルで最後に配信されたカテゴリの画像のURLを取得します。"
            },
            {
                usage: "categoryImageUrl[$user]",
                description: "関連するユーザー(コマンドをトリガーした、ボタンを押したなど)の最後に配信されたカテゴリの画像のURLを取得します。"
            },
            {
                usage: "categoryImageUrl[ebiggz]",
                description: "特定のチャンネルで最後に配信されたカテゴリの画像URLを取得します。"
            },
            {
                usage: "categoryImageUrl[ebiggz, 285x380]",
                description: "異なる画像サイズを取得する（アスペクト比4:3を使用）。デフォルトは285x380です。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (_, username: string, size = "285x380") => {
        if (username == null) {
            username = AccountAccess.getAccounts().streamer.username;
        }

        try {
            const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);
            const category = await TwitchApi.categories.getCategoryById(channelInfo.gameId, size as string);

            return category.boxArtUrl ? category.boxArtUrl : "[No Category Image Found]";
        } catch {
            return "[No Category Image Found]";
        }
    }
};

export default model;