import { ReplaceVariable } from "../../../../../types/variables";

import category from './category';

const model : ReplaceVariable = {
    definition: {
        handle: "game",
        description: category.definition.description,
        examples: [
            {
                usage: "game[$target]",
                description: "コマンドの場合、ターゲットユーザーに設定されているカテゴリ/ゲームを取得します。"
            },
            {
                usage: "game[$user]",
                description: "関連するユーザー（コマンドをトリガーした人、ボタンを押した人など）に設定されているカテゴリー/ゲームを取得します。"
            },
            {
                usage: "game[ChannelOne]",
                description: "特定のチャンネルに設定されているカテゴリ/ゲームを取得します。"
            }
        ],
        categories: category.definition.categories,
        possibleDataOutput: category.definition.possibleDataOutput
    },
    evaluator: category.evaluator
};

export default model;