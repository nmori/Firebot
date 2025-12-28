"use strict";

(function() {
    angular
        .module("firebotApp")
        .factory("animationService", function() {
            const service = {};

            service.animations = {
                enter: [
                    {
                        name: "バウンスイン",
                        class: "bounceIn",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスイン（上）",
                        class: "bounceInUp",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスイン（下）",
                        class: "bounceInDown",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスイン（左）",
                        class: "bounceInLeft",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスイン（右）",
                        class: "bounceInRight",
                        category: "バウンス"
                    },
                    {
                        name: "フェードイン",
                        class: "fadeIn",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（下）",
                        class: "fadeInDown",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（下・大）",
                        class: "fadeInDownBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（上）",
                        class: "fadeInUp",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（上・大）",
                        class: "fadeInUpBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（左）",
                        class: "fadeInLeft",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（左・大）",
                        class: "fadeInLeftBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（右）",
                        class: "fadeInRight",
                        category: "フェード"
                    },
                    {
                        name: "フェードイン（右・大）",
                        class: "fadeInRightBig",
                        category: "フェード"
                    },
                    {
                        name: "フリップイン（X軸）",
                        class: "flipInX",
                        category: "フリップ"
                    },
                    {
                        name: "フリップイン（Y軸）",
                        class: "flipInY",
                        category: "フリップ"
                    },
                    {
                        name: "回転イン",
                        class: "rotateIn",
                        category: "回転"
                    },
                    {
                        name: "回転イン（左下）",
                        class: "rotateInDownLeft",
                        category: "回転"
                    },
                    {
                        name: "回転イン（右下）",
                        class: "rotateInDownRight",
                        category: "回転"
                    },
                    {
                        name: "回転イン（左上）",
                        class: "rotateInUpLeft",
                        category: "回転"
                    },
                    {
                        name: "回転イン（右上）",
                        class: "rotateInUpRight",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（前方・下）",
                        class: "swirlInFwdBottom",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（前方・中央）",
                        class: "swirlInFwdCenter",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（前方・左）",
                        class: "swirlInFwdLeft",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（前方・右）",
                        class: "swirlInFwdRight",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（前方・上）",
                        class: "swirlInFwdTop",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（後方・下）",
                        class: "swirlInBckBottom",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（後方・中央）",
                        class: "swirlInBckCenter",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（後方・左）",
                        class: "swirlInBckLeft",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（後方・右）",
                        class: "swirlInBckRight",
                        category: "回転"
                    },
                    {
                        name: "スワールイン（後方・上）",
                        class: "swirlInBckTop",
                        category: "回転"
                    },
                    {
                        name: "ズームイン",
                        class: "zoomIn",
                        category: "ズーム"
                    },
                    {
                        name: "ズームイン（下）",
                        class: "zoomInDown",
                        category: "ズーム"
                    },
                    {
                        name: "ズームイン（左）",
                        class: "zoomInLeft",
                        category: "ズーム"
                    },
                    {
                        name: "ズームイン（右）",
                        class: "zoomInRight",
                        category: "ズーム"
                    },
                    {
                        name: "ズームイン（上）",
                        class: "zoomInUp",
                        category: "ズーム"
                    },
                    {
                        name: "スライドイン（下）",
                        class: "slideInDown",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（下・全画面）",
                        class: "slideInDownFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（左）",
                        class: "slideInLeft",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（左・全画面）",
                        class: "slideInLeftFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（右）",
                        class: "slideInRight",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（右・全画面）",
                        class: "slideInRightFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（上）",
                        class: "slideInUp",
                        category: "スライド"
                    },
                    {
                        name: "スライドイン（上・全画面）",
                        class: "slideInUpFull",
                        category: "スライド"
                    },
                    {
                        name: "光速イン",
                        class: "lightSpeedIn",
                        category: "その他"
                    },
                    {
                        name: "びっくり箱",
                        class: "jackInTheBox",
                        category: "その他"
                    },
                    {
                        name: "ロールイン",
                        class: "rollIn",
                        category: "その他"
                    },
                    {
                        name: "なし",
                        class: "none",
                        category: "その他"
                    }
                ],
                exit: [
                    {
                        name: "バウンスアウト",
                        class: "bounceOut",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスアウト（上）",
                        class: "bounceOutUp",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスアウト（下）",
                        class: "bounceOutDown",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスアウト（左）",
                        class: "bounceOutLeft",
                        category: "バウンス"
                    },
                    {
                        name: "バウンスアウト（右）",
                        class: "bounceOutRight",
                        category: "バウンス"
                    },
                    {
                        name: "フェードアウト",
                        class: "fadeOut",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（下）",
                        class: "fadeOutDown",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（下・大）",
                        class: "fadeOutDownBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（上）",
                        class: "fadeOutUp",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（上・大）",
                        class: "fadeOutUpBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（左）",
                        class: "fadeOutLeft",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（左・大）",
                        class: "fadeOutLeftBig",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（右）",
                        class: "fadeOutRight",
                        category: "フェード"
                    },
                    {
                        name: "フェードアウト（右・大）",
                        class: "fadeOutRightBig",
                        category: "フェード"
                    },
                    {
                        name: "回転アウト",
                        class: "rotateOut",
                        category: "回転"
                    },
                    {
                        name: "回転アウト（左下）",
                        class: "rotateOutDownLeft",
                        category: "回転"
                    },
                    {
                        name: "回転アウト（右下）",
                        class: "rotateOutDownRight",
                        category: "回転"
                    },
                    {
                        name: "回転アウト（左上）",
                        class: "rotateOutUpLeft",
                        category: "回転"
                    },
                    {
                        name: "回転アウト（右上）",
                        class: "rotateOutUpRight",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（前方・下）",
                        class: "swirlOutFwdBottom",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（前方・中央）",
                        class: "swirlOutFwdCenter",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（前方・左）",
                        class: "swirlOutFwdLeft",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（前方・右）",
                        class: "swirlOutFwdRight",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（前方・上）",
                        class: "swirlOutFwdTop",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（後方・下）",
                        class: "swirlOutBckBottom",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（後方・中央）",
                        class: "swirlOutBckCenter",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（後方・左）",
                        class: "swirlOutBckLeft",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（後方・右）",
                        class: "swirlOutBckRight",
                        category: "回転"
                    },
                    {
                        name: "スワールアウト（後方・上）",
                        class: "swirlOutBckTop",
                        category: "回転"
                    },
                    {
                        name: "ズームアウト",
                        class: "zoomOut",
                        category: "ズーム"
                    },
                    {
                        name: "ズームアウト（下）",
                        class: "zoomOutDown",
                        category: "ズーム"
                    },
                    {
                        name: "ズームアウト（左）",
                        class: "zoomOutLeft",
                        category: "ズーム"
                    },
                    {
                        name: "ズームアウト（右）",
                        class: "zoomOutRight",
                        category: "ズーム"
                    },
                    {
                        name: "ズームアウト（上）",
                        class: "zoomOutUp",
                        category: "ズーム"
                    },
                    {
                        name: "スライドアウト（下）",
                        class: "slideOutDown",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（下・全画面）",
                        class: "slideOutDownFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（左）",
                        class: "slideOutLeft",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（左・全画面）",
                        class: "slideOutLeftFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（右）",
                        class: "slideOutRight",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（右・全画面）",
                        class: "slideOutRightFull",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（上）",
                        class: "slideOutUp",
                        category: "スライド"
                    },
                    {
                        name: "スライドアウト（上・全画面）",
                        class: "slideOutUpFull",
                        category: "スライド"
                    },
                    {
                        name: "光速アウト",
                        class: "lightSpeedOut",
                        category: "その他"
                    },
                    {
                        name: "ヒンジ",
                        class: "hinge",
                        category: "その他"
                    },
                    {
                        name: "ロールアウト",
                        class: "rollOut",
                        category: "その他"
                    },
                    {
                        name: "なし",
                        class: "none",
                        category: "その他"
                    }
                ],
                inbetween: [
                    {
                        name: "なし",
                        class: "none"
                    },
                    {
                        name: "バウンス",
                        class: "bounce"
                    },
                    {
                        name: "フラッシュ",
                        class: "flash"
                    },
                    {
                        name: "パルス",
                        class: "pulse"
                    },
                    {
                        name: "シェイク",
                        class: "shake"
                    },
                    {
                        name: "スイング",
                        class: "swing"
                    },
                    {
                        name: "タダー",
                        class: "tada"
                    },
                    {
                        name: "ウォブル",
                        class: "wobble"
                    },
                    {
                        name: "ジェロー",
                        class: "jello"
                    }
                ]
            };

            return service;
        });
}());
