import { ReplaceVariable } from "../../../../../types/variables";
import { isConnected } from "../obs-remote";

export const IsConnectedVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsConnected",
        description: "OBS が現在接続中なら 'true'、そうでなければ 'false' を返します。",
        possibleDataOutput: ["bool"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: async () => {
        return isConnected() ?? false;
    }
};
