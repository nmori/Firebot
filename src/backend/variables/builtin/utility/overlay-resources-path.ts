import path from "path";
import type { ReplaceVariable } from "../../../../types/variables";
import * as dataAccess from "../../../common/data-access";

const model : ReplaceVariable = {
    definition: {
        handle: "overlayResourcesPath",
        usage: "overlayResourcesPath",
        description: "overlay-resources フォルダへの絶対パスを文字列で返します。画像・音声・動画を overlay-resources フォルダに保存している場合に便利です。",
        examples: [
            {
                usage: "overlayResourcesPath[sub, dir, path, image.gif]",
                description: "overlay-resources フォルダ内の `/sub/dir/path/image.gif` への絶対パスを文字列で返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, ...values: string[]) =>
        (
            (values != null || values.length > 0)
                ? `${path.resolve(dataAccess.getPathInUserData("/overlay-resources"), values.join("/"))}`
                : dataAccess.getPathInUserData("/overlay-resources")
        )
};

export default model;