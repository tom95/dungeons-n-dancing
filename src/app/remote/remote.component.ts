import { Component, OnInit } from '@angular/core';
import { PlaybackManagerProxy } from '../playback-manager';

@Component({
  selector: 'dnd-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.scss']
})
export class RemoteComponent implements OnInit {
  private playbackProxy = new PlaybackManagerProxy();

  constructor() {
  }

  ngOnInit() {
  }

}
