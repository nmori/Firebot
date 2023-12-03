"use strict";

(function() {

    const uuid = require("uuid");

    // This provides methods for playing sounds

    angular
        .module("firebotApp")
        .factory("videoService", function(backendCommunicator) {
            const service = {};

            service.getVideoDuration = function (path) {
                return new Promise((resolve) => {
                    const id = "video-" + uuid();
                    const videoElement = `<video id="${id}" preload="metadata" style="display: none;"></video>`;
                    $(document.documentElement).append(videoElement);
                    const video = document.getElementById(id);
                    video.onloadedmetadata = () => {
                        resolve(video.duration);
                        video.remove();
                    };

                    video.onerror = () => {
                        const result = {
                            error: video.error.message,
                            path: video.src
                        };
                        video.remove();
                        resolve(result);
                    };

                    video.src = path;
                });
            };

            service.getYoutubeVideoDuration = function (videoId) {
                return new Promise((resolve) => {
                    const id = "video-" + uuid();
                    $(document.documentElement).append(`<div id="${id}" style="display: none;"></div>`);
                    // eslint-disable-next-line no-undef
                    const player = new YT.Player(id, {
                        videoId: videoId,
                        events: {
                            onReady: (event) => {
                                event.target.setVolume(0);
                                event.target.playVideo();
                                if (player.getDuration() === 0) {
                                    return;
                                }
                                resolve(player.getDuration());
                                document.getElementById(id).remove();
                            },
                            onError: (event) => {
                                const error = {
                                    code: event.data,
                                    youtubeId: videoId
                                };
                                if (event.data === "2") {
                                    error.error = "リクエストに無効なパラメータ値が含まれています。";
                                }
                                if (event.data === "5") {
                                    error.error = "要求されたコンテンツは HTML5 プレーヤーで再生できないか、HTML5 プレーヤーに関連する別のエラーが発生しました。";
                                }
                                if (event.data === "100") {
                                    error.error = "要求された動画が見つかりません。このエラーは、動画が（何らかの理由で）削除されているか、非公開に設定されている場合に発生します。";
                                }
                                if (event.data === "101" || event.data === "150") {
                                    error.error = "要求されたビデオの所有者は、埋め込みプレーヤーでの再生を許可していません。";
                                }
                                resolve(error);
                                document.getElementById(id).remove();
                            }
                        }
                    });
                });
            };

            backendCommunicator.onAsync("getVideoDuration", async (path) => {
                return await service.getVideoDuration(path);
            });

            backendCommunicator.onAsync("getYoutubeVideoDuration", async (youtubeId) => {
                return await service.getYoutubeVideoDuration(youtubeId);
            });

            return service;
        });
}(window.angular));
