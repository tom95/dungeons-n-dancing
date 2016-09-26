
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
					e.data.preloadStartingTime,
					e.data.fadeOutDuration);
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

function notifyPrepared() {
	reply({ eventPrepared: true });
}
function notifyStarted() {
	reply({ eventStarted: true });
}
function notifyProgress(current, total) {
	reply({ eventEnding: true, current: current, total: total });
}
function notifyToggleBuffering(isBuffering) {
	reply({ eventToggleBuffering: true, buffering: isBuffering });
}
function notifyEnding() {
	reply({ eventEnding: true });
}
function notifyStartingFadeOut() {
	reply({ eventStartingFadeOut: true });
}
function notifyEnded() {
	reply({ eventEnded: true });
}

var player;

function setPlaying(playing) {
	if (playing)
		player.playVideo();
	else
		player.pauseVideo();
}

function prepare(url, start, end, preloadStartingTime, fadeOutDuration) {
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

	var startTime = start < 0 ? 0 : start;
	var totalDuration;

	var checkNearEndingInterval;
	var ready = false;
	var buffering = false;
	var aboutToFinishSent = false;
	var timeStartFadeSent = false;
	function onPlayerStateChange(event) {
		if (event.data == YT.PlayerState.PLAYING && !ready) {
			if (buffering) {
				notifyToggleBuffering(false);
				buffering = false;
			}

			event.target.pauseVideo();
			ready = true;
			start = Math.max(0, start);
			totalDuration = (end < 0 ? player.getDuration() : end) - start;
			notifyPrepared();
			notifyProgress(0, totalDuration);

			checkNearEndingInterval = setInterval(function() {
				var current = player.getCurrentTime() - start;
				if (!aboutToFinishSent && totalDuration - current < preloadStartingTime) {
					aboutToFinishSent = true;
					notifyEnding();
				}

				console.log(timeStartFadeSent, totalDuration - current, current, totalDuration);
				if (!timeStartFadeSent && totalDuration - current < fadeOutDuration) {
					console.log('EMIT FADEOUT');
					timeStartFadeSent = true;
					fadeOut(fadeOutDuration);
					notifyStartingFadeOut();
				}
				notifyProgress(current, totalDuration);
			}, 1000);
		} else if (event.data == YT.PlayerState.PLAYING && buffering) {
			buffering = false;
			notifyToggleBuffering(false);
		} else if (event.data == YT.PlayerState.ENDED) {
			clearInterval(checkNearEndingInterval);
			notifyEnded();
		} else if (event.data == YT.PlayerState.BUFFERING) {
			notifyToggleBuffering(true);
			buffering = true;
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
	notifyStarted();

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

