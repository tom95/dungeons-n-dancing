import { Component, ElementRef, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Playlist } from '../playlist';

interface JQueryX extends JQuery {
  popover(options: Object): JQuery;
}

@Component({
  selector: 'dnd-playlist-selector',
  templateUrl: './playlist-selector.component.html',
  styleUrls: ['./playlist-selector.component.scss']
})
export class PlaylistSelectorComponent implements OnInit {
  @Input() playlist: Playlist;
  @Output() selected = new EventEmitter();
  hovered: boolean = false;

  constructor(private element: ElementRef) { }

  ngOnInit() {
    /*let e = $(this.element.nativeElement).find('[data-toggle="popover"]') as JQueryX;
    e.popover({
      position: 'right',
      container: 'body',
      html: true,
      content: () => {
        return ;
      }
    });*/
  }

}
