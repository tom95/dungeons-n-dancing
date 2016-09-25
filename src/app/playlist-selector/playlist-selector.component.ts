import { Component, ElementRef, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Playlist } from '../playlist';

@Component({
  selector: 'dnd-playlist-selector',
  templateUrl: './playlist-selector.component.html',
  styleUrls: ['./playlist-selector.component.scss']
})
export class PlaylistSelectorComponent implements OnInit {
  @Input() playlist: Playlist;
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();

  hovered: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  askDelete() {
    if (confirm('Delete this playlist?'))
      return this.deleted.emit();
  }
}
