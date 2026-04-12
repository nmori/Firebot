"use strict";
(function() {
    //This handles the Settings tab
    angular
        .module("firebotApp")
        .controller("settingsController", function($scope, settingsService) {
            $scope.settings = settingsService;

            $scope.categories = [
                {
                    name: "一般",
                    description: "見た目やベータ通知など、さまざまな設定です。",
                    icon: "fa-sliders-v-square",
                    template: "<general-settings />"
                },
                {
                    name: "ダッシュボード",
                    description: "チャット、クイックアクションなどのダッシュボード要素に関する設定です",
                    icon: "fa-signal-stream",
                    template: "<dashboard-settings />"
                },
                {
                    name: "トリガー",
                    description: "各種トリガー（コマンド、イベント等）の挙動を調整します",
                    icon: "fa-bolt",
                    template: "<trigger-settings />"
                },
                {
                    name: "エフェクト",
                    description: "エフェクトに関する各種オプションです",
                    icon: "fa-magic",
                    template: "<effect-settings />"
                },
                {
                    name: "データベース",
                    description: "視聴者データベース向けのオプションとツールです。",
                    icon: "fa-database",
                    template: "<database-settings />"
                },
                {
                    name: "オーバーレイ",
                    description: "新しいフォント追加、インスタンス作成などのオーバーレイ設定です。",
                    icon: "fa-tv",
                    template: "<overlay-settings />"
                },
                {
                    name: "連携",
                    description: "Firebotをさまざまなサードパーティ製ツールやアプリと連携します。",
                    icon: "fa-globe",
                    template: "<integration-settings />"
                },
                {
                    name: "TTS",
                    description: "既定のTTS音声に関する設定です。",
                    icon: "fa-volume",
                    template: "<tts-settings />"
                },
                {
                    name: "バックアップ",
                    description: "バックアップとその設定を管理し、データ損失を防ぎます。",
                    icon: "fa-file-archive",
                    template: "<backups-settings />"
                },
                {
                    name: "スクリプト",
                    description: "スクリプト設定の構成、起動時スクリプト追加などを行います。",
                    icon: "fa-code",
                    template: "<scripts-settings />"
                },
                {
                    name: "詳細設定",
                    description: "デバッグモード、whileループ、その他ツールなどの詳細設定です",
                    icon: "fa-tools",
                    template: "<advanced-settings />"
                }
            ];

            $scope.selectedCategory = $scope.categories[0];
            $scope.setSelectedCategory = (category) => {
                $scope.selectedCategory = category;
            };

            if (settingsService.getSetting("AutoUpdateLevel") > 3) {
                settingsService.saveSetting("AutoUpdateLevel", 3);
            }
        });
}());