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

// 連続値（リニア）抽選: 表示のたびにビューポートに対する % で top/left を抽選する。
// プリセット9値（Top Left ... Bottom Right）の離散的な3〜9択ではなく、画面内を滑らかに動かしたい時に使う。
function getStylesForRandomLinear(position) {
	const stripped = position.replace(/\s*Linear$/i, "").trim();
	const parts = stripped === "Random" ? ["Random", "Random"] : stripped.split(/\s+/);
	const yMode = parts[0];
	const xMode = parts[1];

	// 0〜85% に抑えて、ウィジェット自身の幅・高さで画面外にはみ出しにくくする。
	const yRandom = Math.floor(Math.random() * 86);
	const xRandom = Math.floor(Math.random() * 86);

	const decls = ["position:absolute", "margin:0"];
	let translateX = 0;
	let translateY = 0;

	if (yMode === "Random") {
		decls.push(`top:${yRandom}%`);
	} else if (yMode === "Top") {
		decls.push("top:1.5%");
	} else if (yMode === "Middle") {
		decls.push("top:50%");
		translateY = -50;
	} else if (yMode === "Bottom") {
		decls.push("bottom:1.5%");
	}

	if (xMode === "Random") {
		decls.push(`left:${xRandom}%`);
	} else if (xMode === "Left") {
		decls.push("left:1.5%");
	} else if (xMode === "Middle") {
		decls.push("left:50%");
		translateX = -50;
	} else if (xMode === "Right") {
		decls.push("right:1.5%");
	}

	if (translateX !== 0 || translateY !== 0) {
		decls.push(`transform:translate(${translateX}%, ${translateY}%)`);
	}

	return decls.join(";") + ";";
}

function getPositionWrappedHTML(uniqueId, positionData, html) {

    // when using 'Custom' position, the user has defined exact top/left pixels
	let styles = "";
	let position = positionData.position ?
		positionData.position.replace(/\s/, "-").toLowerCase() : "middle";

	if (positionData.position === "Custom") {
		styles = getStylesForCustomCoords(positionData.customCoords);
	} else if (isRandomLinearPosition(positionData.position)) {
		// 連続値で抽選するため、wrapper の flex justify は使わず inner-position を絶対配置する。
		styles = getStylesForRandomLinear(positionData.position);
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