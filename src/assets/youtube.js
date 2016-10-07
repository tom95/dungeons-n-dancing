
var reply;
var frameId;

window.addEventListener('message', function(e) {
	var host = event.source;
	var hostOrigin = e.origin;

	var command = e.data.command;
	switch (command) {
		case 'prepare':
			frameId = e.data.frameId;
			reply = function(data) {
				data.frameId = frameId;
				window.parent.postMessage(data, hostOrigin);
			};
			prepare(e.data.url,
					e.data.start,
					e.data.end);
			break;
		case 'setPlaying':
			setPlaying(e.data.playing);
			break;
		case 'setVolume':
			setVolume(e.data.volume);
	}
});

function notifyPrepared() {
	reply({ eventPrepared: true });
}
function notifyProgress(current, total) {
	reply({ eventProgress: true, current: current, total: total });
}
function notifyToggleBuffering(isBuffering) {
	reply({ eventToggleBuffering: true, buffering: isBuffering });
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
		event.target.setVolume(100);
		event.target.playVideo();
	}

	var startTime = start < 0 ? 0 : start;
	var totalDuration;

	var progressInterval;
	var ready = false;
	var buffering = false;
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

			progressInterval = setInterval(function() {
				var current = player.getCurrentTime() - start;
				notifyProgress(current, totalDuration);
			}, 300);
		} else if (event.data == YT.PlayerState.PLAYING && buffering) {
			buffering = false;
			notifyToggleBuffering(false);
		} else if (event.data == YT.PlayerState.ENDED) {
			clearInterval(progressInterval);
			notifyProgress(totalDuration, totalDuration);
		} else if (event.data == YT.PlayerState.BUFFERING) {
			notifyToggleBuffering(true);
			buffering = true;
		}
	}
}

function setVolume(vol) {
	player.setVolume(vol * 100);
}

