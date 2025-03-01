"use strict";
(function () {
    //This handles the Settings tab
    angular
        .module("firebotApp")
        .controller("settingsController", function ($scope, settingsService) {
            $scope.settings = settingsService;

            $scope.categories = [
                {
                    name: "一般",
                    description: "外観やベータ版通知など、さまざまな設定が可能です",
                    icon: "fa-sliders-v-square",
                    template: "<general-settings />"
                },
                {
                    name: "セットアップ",
                    description: "あなたの設定を他の人と共有したり、他の人の設定を取り込めます",
                    icon: "fa-box-full",
                    template: "<setups-settings />"
                },
                {
                    name: "起動条件",
                    description: "様々な起動条件（コマンド、イベントなど）の動作を微調整します",
                    icon: "fa-bolt",
                    template: "<trigger-settings />"
                },
                {
                    name: "データベース",
                    description: "視聴者データベースのオプションとツール",
                    icon: "fa-database",
                    template: "<database-settings />"
                },
                {
                    name: "オーバーレイ",
                    description: "新しいフォントの追加、新しいインスタンスの作成、その他のオーバーレイ設定をします",
                    icon: "fa-tv",
                    template: "<overlay-settings />"
                },
                {
                    name: "連携",
                    description: "サードパーティ製ツールやアプリとFirebotをリンクさせます",
                    icon: "fa-globe",
                    template: "<integration-settings />"
                },
                {
                    name: "合成音声（Text To Speech）",
                    description: "読み上げ音声の設定を変えられます",
                    icon: "fa-volume",
                    template: "<tts-settings />"
                },
                {
                    name: "バックアップ",
                    description: "バックアップとバックアップ設定を管理し、データが失われないようにします",
                    icon: "fa-file-archive",
                    template: "<backups-settings />"
                },
                {
                    name: "スクリプト",
                    description: "スクリプトの設定、スタートアップスクリプトの追加などをします",
                    icon: "fa-code",
                    template: "<scripts-settings />"
                },
                {
                    name: "応用",
                    description: "デバッグモード、whileループ、その他のツールなど、様々な高度な設定をします",
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