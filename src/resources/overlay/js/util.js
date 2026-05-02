// Global
notificationShown = false;

// Shim for default generation
function uuid() {
    return uuidv4();
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  	(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

// Handle notifications
function notification(status, text){
	var divStatus = $('.notification').is(':visible');

	// Check if we need to show notification or not.
	if(divStatus === false && status === "open" && notificationShown === false){
		// Show the notification
		notificationShown = true;
		$('body').prepend('<div class="notification" style="display:none"><p>'+text+'</p></div>');
		$('.notification').fadeIn('fast');
		setTimeout(function(){
			$(".notification p").text("I'll keep trying in the background...");
			setTimeout(function(){
				$(".notification").fadeOut(300, function() { $(this).remove(); });
			}, 5000);
		}, 30000);
	} else if (status === "close"){
		// Fade out and remove notification
		notificationShown = false;
		$(".notification").fadeOut(300, function() { $(this).remove(); });
	}
}

$.fn.extend({
    animateCss: function (animationName, animationDuration, animationDelay, animationRepeat, callback, data) {
		if(callback == null || !(callback instanceof Function)) {
			callback = () => {};
		}
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		if(animationName !== "none") {
			const element = $(this);

			if(animationDuration) {
				element.css("animation-duration", animationDuration);
			}

			if(animationDelay) {
				element.css("animation-delay", animationDelay);
			}

			if(animationRepeat) {
				element.css("animation-iteration-count", animationRepeat);
			}

			this.addClass('animated ' + animationName).on(animationEnd, function(event) {
				element.off(animationEnd);

				if(animationDuration) {
					element.css("animation-duration", "");
				}

				if(animationDelay) {
					element.css("animation-delay", "");
				}

				element.removeClass('animated ' + animationName);

                if(callback != null) {
                    callback(data);
                }
			});
		} else {
            if(callback != null) {
                callback(data);
            }
		}
        return this;
    }
});

function showTimedAnimatedElement(
	elementClass,
	enterAnimation,
	enterDuration,
	inbetweenAnimation,
	inbetweenDelay,
	inbetweenDuration,
	inbetweenRepeat,
	exitAnimation,
	exitDuration,
	duration,
	tokenArg,
	completeCallback = null) {
	enterAnimation = enterAnimation ? enterAnimation : "fadeIn";
	exitAnimation = exitAnimation ? exitAnimation : "fadeOut";
	inbetweenAnimation = inbetweenAnimation ? inbetweenAnimation : "none";
	var id = `${elementClass}`;
	$(id).find(".inner-position").animateCss(enterAnimation, enterDuration, null, null, (data) => {

		$(data.id).find(".inner-position").animateCss(data.inbetweenAnimation, data.inbetweenDuration, data.inbetweenDelay, data.inbetweenRepeat);

		setTimeout(function(){
			if(data.inbetweenAnimation) {
				$(data.id).find(".inner-position").css("animation-duration", "");
				$(data.id).find(".inner-position").css("animation-delay", "");
				$(data.id).find(".inner-position").css("animation-iteration-count", "");
				$(this).find(".inner-position").removeClass('animated ' + data.inbetweenAnimation);
			}
			$(data.id).find(".inner-position").animateCss(data.exitAnimation, data.exitDuration, null, null, (data1) => {
				$(data1.id).remove();
				if(completeCallback) {
					completeCallback();
				}
			}, data);
		}, (duration === 0 || duration != null) ? duration : 5000);
	}, {
		token: tokenArg,
		id: id,
		exitAnimation: exitAnimation,
		exitDuration: exitDuration,
		inbetweenAnimation: inbetweenAnimation,
		inbetweenDuration: inbetweenDuration,
		inbetweenDelay: inbetweenDelay,
		inbetweenRepeat: inbetweenRepeat
	});
}

const RANDOM_LINEAR_POSITIONS = [
	"Random Linear",
	"Top Random Linear",
	"Middle Random Linear",
	"Bottom Random Linear",
	"Random Left Linear",
	"Random Middle Linear",
	"Random Right Linear"
];

function isRandomLinearPosition(position) {
	return RANDOM_LINEAR_POSITIONS.indexOf(position) >= 0;
}

// リニアランダム配置が必要か判定する。
function needsLinearRandomPlacement(positionData) {
	if (isRandomLinearPosition(positionData.position)) {
		return true;
	}
	if (positionData.position === "Custom" && positionData.customCoords) {
		return positionData.customCoords.xMode === "linear-random" ||
		       positionData.customCoords.yMode === "linear-random";
	}
	return false;
}

// リニアランダム配置: DOM 挿入後に実際の要素サイズを測定し、画面内に収まる px 座標を算出して適用する。
// preset の "* Linear" も Custom の軸別ランダムも同じ関数で処理する。
function applyLinearRandomBounds(uniqueId, positionData) {
	const wrapperEl = document.getElementById(uniqueId);
	if (!wrapperEl) { return; }
	const innerEl = wrapperEl.querySelector(".inner-position");
	if (!innerEl) { return; }

	const wW = wrapperEl.offsetWidth  || (window.innerWidth  || 1280);
	const wH = wrapperEl.offsetHeight || (window.innerHeight || 720);

	// ランダム値は一度だけ生成し、再計算時も同じ相対位置（比率）を維持する。
	const rY = Math.random();
	const rX = Math.random();

	function computeAndApply() {
		// サイズ未確定（読み込み前）の場合は画面の 15% をフォールバックとして使う。
		const iW = innerEl.offsetWidth  > 0 ? innerEl.offsetWidth  : Math.round(wW * 0.15);
		const iH = innerEl.offsetHeight > 0 ? innerEl.offsetHeight : Math.round(wH * 0.15);
		const maxX = Math.max(0, wW - iW);
		const maxY = Math.max(0, wH - iH);

		var topPx = null, bottomPx = null, leftPx = null, rightPx = null;

		if (positionData.position === "Custom") {
			var coords = positionData.customCoords || {};
			if (coords.yMode === "linear-random") {
				topPx = Math.round(rY * maxY);
			} else {
				if      (coords.top    != null) { topPx    = coords.top;    }
				else if (coords.bottom != null) { bottomPx = coords.bottom; }
				else                            { topPx    = 0; }
			}
			if (coords.xMode === "linear-random") {
				leftPx = Math.round(rX * maxX);
			} else {
				if      (coords.left  != null) { leftPx  = coords.left;  }
				else if (coords.right != null) { rightPx = coords.right; }
				else                           { leftPx  = 0; }
			}
		} else {
			// preset の Random Linear 系
			var stripped = positionData.position.replace(/\s*Linear$/i, "").trim();
			var parts = stripped === "Random" ? ["Random", "Random"] : stripped.split(/\s+/);
			var yMode = parts[0];
			var xMode = (parts.length > 1) ? parts[1] : "Random";

			if      (yMode === "Random") { topPx    = Math.round(rY * maxY); }
			else if (yMode === "Top")    { topPx    = Math.round(wH * 0.015); }
			else if (yMode === "Middle") { topPx    = Math.round((wH - iH) / 2); }
			else if (yMode === "Bottom") { bottomPx = Math.round(wH * 0.015); }

			if      (xMode === "Random") { leftPx  = Math.round(rX * maxX); }
			else if (xMode === "Left")   { leftPx  = Math.round(wW * 0.015); }
			else if (xMode === "Middle") { leftPx  = Math.round((wW - iW) / 2); }
			else if (xMode === "Right")  { rightPx = Math.round(wW * 0.015); }
		}

		var style = "position:absolute;margin:0;";
		if (topPx    !== null) { style += "top:"    + topPx    + "px;"; }
		if (bottomPx !== null) { style += "bottom:" + bottomPx + "px;"; }
		if (leftPx   !== null) { style += "left:"   + leftPx   + "px;"; }
		if (rightPx  !== null) { style += "right:"  + rightPx  + "px;"; }
		style += "visibility:visible;";

		innerEl.style.cssText = style;
	}

	// 初回: DOM 挿入直後に同期計測して配置する。
	computeAndApply();

	// 画像・動画は読み込み後にサイズが確定するため、再度配置を適用する。
	var mediaEl = innerEl.querySelector("img, video");
	if (mediaEl) {
		var recompute = function() { computeAndApply(); };
		if (mediaEl.tagName === "IMG") {
			if (!mediaEl.complete || mediaEl.naturalWidth === 0) {
				mediaEl.addEventListener("load", recompute, { once: true });
			}
		} else if (mediaEl.tagName === "VIDEO") {
			if (mediaEl.readyState < 1) {
				mediaEl.addEventListener("loadedmetadata", recompute, { once: true });
			}
		}
	}
}

function getPositionWrappedHTML(uniqueId, positionData, html) {

    // when using 'Custom' position, the user has defined exact top/left pixels
	let styles = "";
	let position = positionData.position ?
		positionData.position.replace(/\s/, "-").toLowerCase() : "middle";

	if (positionData.position === "Custom") {
		var coords = positionData.customCoords;
		if (coords && (coords.xMode === "linear-random" || coords.yMode === "linear-random")) {
			// 軸別リニアランダム: DOM 挿入後に JS で配置するため不可視プレースホルダーとして挿入する。
			styles = "position:absolute;margin:0;visibility:hidden;";
			position = "custom";
		} else {
			styles = getStylesForCustomCoords(coords);
		}
	} else if (isRandomLinearPosition(positionData.position)) {
		// 連続値で抽選するため、DOM 挿入後に JS で実寸計測して配置する。
		styles = "position:absolute;margin:0;visibility:hidden;";
		position = "custom";
	}

	let positionWrappedHtml = `
		<div id="${uniqueId}" class="position-wrapper ${position}">
			<div class="inner-position" style="${styles}">
				${html}
			</div>
		</div>
    `;

    return positionWrappedHtml;
}

function showElement(
	effectHTML,
	positionData,
	animationData
){
	let uniqueId = uuid();

	let positionWrappedHtml = getPositionWrappedHTML(uniqueId, positionData, effectHTML);

	$('.wrapper').append(positionWrappedHtml);

	// リニアランダム配置が必要な場合は、DOM 挿入後に実寸を測って配置を確定する。
	if (needsLinearRandomPlacement(positionData)) {
		applyLinearRandomBounds(uniqueId, positionData);
	}

	showTimedAnimatedElement(
		"#" + uniqueId,
		animationData.enterAnimation,
		animationData.enterDuration,
		animationData.inbetweenAnimation,
		animationData.inbetweenDelay,
		animationData.inbetweenDuration,
		animationData.inbetweenRepeat,
		animationData.exitAnimation,
		animationData.exitDuration,
		animationData.totalDuration,
		animationData.resourceToken
	);

    return uniqueId;
}

function getStylesForCustomCoords(customCoords) {

	var style = "position:absolute;margin:auto;"
	if(customCoords.top != null) {
		style = style + "top:" + customCoords.top.toString() + "px;"
	}
	if(customCoords.bottom != null) {
		style = style + "bottom:" + customCoords.bottom.toString() + "px;"
	}
	if(customCoords.left != null) {
		style = style + "left:" + customCoords.left.toString() + "px;"
	}
	if(customCoords.right != null) {
		style = style + "right:" + customCoords.right.toString() + "px;"
	}

	return style;
}

/* Polyfill EventEmitter. */
var EventEmitter = function () {
    this.events = {};
};

EventEmitter.prototype.on = function (event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }

    this.events[event].push(listener);
};

EventEmitter.prototype.removeListener = function (event, listener) {
    var idx;

    if (typeof this.events[event] === 'object') {
        idx = this.events[event].indexOf(listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

EventEmitter.prototype.emit = function (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

EventEmitter.prototype.once = function (event, listener) {
    this.on(event, function g () {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};