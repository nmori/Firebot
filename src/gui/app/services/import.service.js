"use strict";

/** @import { ThirdPartyImporter, LoadResult, ParsedQuotes, ParsedViewers } from "../../../types/import" */

(function() {
    angular
        .module("firebotApp")
        .factory("importService", function(
            backendCommunicator,
            ngToast
        ) {
            const service = {};

            /** @type { Record<string, ThirdPartyImporter> } */
            service.importers = {};

            service.loadQuotes = async (appId, filepath) => {
                /** @type { LoadResult<ParsedQuotes> } */
                const result = await backendCommunicator.fireEventAsync("import:load-quotes", {
                    appId,
                    filepath
                });

                if (result.success) {
                    return result.data;
                }

                ngToast.create({
                    className: "error",
                    content: result.error ?? "引用のインポート中に不明なエラーが発生しました"
                });

                return null;
            };

            service.loadViewers = async (appId, filepath) => {
                /** @type { LoadResult<ParsedViewers> } */
                const result = await backendCommunicator.fireEventAsync("import:load-viewers", {
                    appId,
                    filepath
                });

                if (result.success) {
                    return result.data;
                }

                ngToast.create({
                    className: "error",
                    content: result.error ?? "視聴者データのインポート中に不明なエラーが発生しました"
                });

                return null;
            };

            return service;
        });
}());