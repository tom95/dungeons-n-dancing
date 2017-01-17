import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Track } from '../track';
import { YoutubeTrack } from '../youtube-track';

@Component({
  selector: 'dnd-track-chooser-youtube',
  templateUrl: './track-chooser-youtube.component.html',
  styleUrls: ['./track-chooser-youtube.component.scss']
})
export class TrackChooserYoutubeComponent implements OnInit {
  @Input() track: Track;
  @Output() created = new EventEmitter<Track>();

  youtubeUrl: string;
  youtubeTitle: string;
  youtubeStart: string;
  youtubeEnd: string;

  constructor() { }

  ngOnInit() {
    this.load();
  }

  load() {
    if (this.track.constructor.name !== 'YoutubeTrack') {
      return;
    }

    let t = this.track as YoutubeTrack;
    this.youtubeTitle = t.ytTitle;
    this.youtubeUrl = t.url;
    this.youtubeStart = t.start < 0 ? undefined : t.start.toString();
    this.youtubeEnd = t.end < 0 ? undefined : t.end.toString();
  }

  create() {
    let ytTrack = new YoutubeTrack(this.youtubeUrl, this.youtubeStart, this.youtubeEnd, this.youtubeTitle);
    this.youtubeUrl = '';
    this.youtubeTitle = '';
    this.youtubeStart = undefined;
    this.youtubeEnd = undefined;
    this.created.emit(ytTrack);
  }

}
