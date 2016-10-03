import { Track } from './track';
import { YoutubeTrack } from './youtube-track';
import { EmptyTrack } from './empty-track';
import { LocalTrack } from './local-track';
import { Playback, NormalPlayback, RandomPlayback } from './playback';
import { PlaybackManager } from './playback-manager';

export class Playlist {
	items: Array<Track> = [];
	playback: Playback;
	playlistTitle: string;
	backgroundUrl: string;

	constructor(title, private playbackManager: PlaybackManager) {
		this.playlistTitle = title;
	}

	backgroundImageStyle() {
		return this.backgroundUrl ? 'url(' + this.backgroundUrl + ')' : '';
	}

	add(track: Track) {
		this.items.push(track);
	}

	title(): string {
		return this.playlistTitle;
	}

	play() {
		this.playbackManager.replace(this.items);
	}

	findStartTrack(): Track {
		return this.playback.findStartTrack(this.items);
	}

	nextTrack(previous: Track): Track {
		return this.playback.nextTrack(this.items, previous);
	}

	serialize(): Promise<any> {
		return Promise.all(this.items.map(track => track.serialize())).then(tracks => ({
			title: this.playlistTitle,
			backgroundUrl: this.backgroundUrl,
			tracks: tracks,
			type: 'playlist'
		})).then(playlist => this.playback.serialize(playlist));
	}
}
