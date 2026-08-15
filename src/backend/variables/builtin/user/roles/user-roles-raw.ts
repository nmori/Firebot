import type { ReplaceVariable } from "../../../../../types/variables";

import userRoles from './user-roles';

const model : ReplaceVariable = {
    definition: {
        handle: "rawUserRoles",
        description: "(非推奨: $userRoles を使用してください) ユーザーのすべてのロールを生配列で返します。",
        usage: "rawUserRoles[username, all|twitch|team|firebot|custom]",
        examples: [
            {
                usage: 'rawUserRoles',
                description: "ユーザーのすべてのロールを返します。"
            },
            {
                usage: 'rawUserRoles[$user]',
                description: "指定したユーザーのすべてのロールを返します。"
            },
            {
                usage: 'rawUserRoles[$user, all]',
                description: "指定したユーザーのすべてのロールを、Twitch・チーム・Firebot・カスタムロールの順で入れ子の配列として返します。"
            },
            {
                usage: 'rawUserRoles[$user, firebot]',
                description: "指定したユーザーのすべての Firebot ロールを返します。"
            },
            {
                usage: 'rawUserRoles[$user, custom]',
                description: "指定したユーザーのすべてのカスタムロールを返します。"
            },
            {
                usage: 'rawUserRoles[$user, twitch]',
                description: "指定したユーザーのすべての Twitch ロールを返します。"
            },
            {
                usage: 'rawUserRoles[$user, team]',
                description: "指定したユーザーのすべての Twitch チームロールを返します。"
            }
        ],
        categories: ["common", "user based"],
        possibleDataOutput: ["array"],
        hidden: true
    },
    evaluator: userRoles.evaluator
};

export default model;