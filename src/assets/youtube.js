
var reply;

window.addEventListener('message', function(e) {
	var host = event.source;
	var hostOrigin = e.origin;

	var command = e.data.command;
	switch (command) {
		case 'prepare':
			reply = function(data) {
				window.parent.postMessage(data, hostOrigin);
			};
			prepare(e.data.url,
					e.data.start,
					e.data.end,
					e.data.aboutToFinish,
					e.data.startFade);
			break;
		case 'play':
			play(e.data.fadeInDuration);
			break;
		case 'setPlaying':
			setPlaying(e.data.playing);
			break;
		case 'fadeOut':
			fadeOut(e.data.duration);
			break;
	}
});

function notifyPlayFinished() {
	reply({ playFinished: true });
}
function notifyPrepareFinished() {
	reply({ prepareFinished: true });
}
function notifyStartFade() {
	reply({ startFade: true });
}
function notifyEnding() {
	reply({ ending: true });
}

var player;

function setPlaying(playing) {
	if (playing)
		player.playVideo();
	else
		player.pauseVideo();
}

function prepare(url, start, end, timeAboutToFinish, timeStartFade) {
	if (url.substring(0, 4) == 'http')
		url = url.match(/watch\?v=([^&]+)/)[1];

	var args = {
		height: '390',
		width: '640',
		videoId: url,
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	};
	var extra = {};
	if (start > 0) extra.start = start;
	if (end > 0) extra.end = end;
	args.playerVars = extra;

	player = new YT.Player('player', args);

	function onPlayerReady(event) {
		event.target.setVolume(0);
		event.target.playVideo();
	}

	var checkNearEndingInterval;
	var ready = false;
	var aboutToFinishSent = false;
	var timeStartFadeSent = false;
	function onPlayerStateChange(event) {
		if (event.data == YT.PlayerState.PLAYING && !ready) {
			event.target.pauseVideo();
			ready = true;
			notifyPrepareFinished();
			checkNearEndingInterval = setInterval(function() {
				if (!aboutToFinishSent && end - player.getCurrentTime() < timeAboutToFinish) {
					aboutToFinishSent = true;
					notifyEnding();
				}
				if (!timeStartFadeSent && end - player.getCurrentTime() < timeStartFade) {
					timeStartFadeSent = true;
					fadeOut(timeStartFade);
					notifyStartFade();
				}
			}, 1000);
		} if (event.data == YT.PlayerState.ENDED) {
			clearInterval(checkNearEndingInterval);
			notifyPlayFinished();
		}
	}
}

const INCREMENT_SPEED = 10;

function fadeOut(duration) {
	var volume = 100;
	var step = 100.0 / duration * INCREMENT_SPEED;

	function decr() {
		volume -= step;
		if (volume > 0) {
			player.setVolume(volume);
			setTimeout(() => {
				decr();
			}, INCREMENT_SPEED);
		} else {
			player.setVolume(0);
			player.stopVideo();
		}
	}
	decr();
}

function play(fadeInDuration) {
	player.playVideo();

	var volume = 0;
	var step = 100.0 / fadeInDuration * INCREMENT_SPEED;

	function incr() {
		volume += step;
		if (volume < 100) {
			player.setVolume(volume);
			setTimeout(() => {
				incr();
			}, INCREMENT_SPEED);
		} else
			player.setVolume(100);
	}
	incr();
}

