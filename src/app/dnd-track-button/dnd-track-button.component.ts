import {
  Component,
  EventEmitter,
  Injectable,
  OnInit,
  Input,
  Output,
  Pipe,
  PipeTransform
} from '@angular/core';
import { Track } from '../track';
import { YoutubeTrack } from '../youtube-track';
import { EmptyTrack } from '../empty-track';
import { LocalTrack } from '../local-track';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dnd-track-button',
  templateUrl: './dnd-track-button.component.html',
  styles: []
})
export class DndTrackButtonComponent implements OnInit {

  @Input() track : Track;
  @Output() trackSelected = new EventEmitter<Track>();
  @Output() trackDeleted = new EventEmitter<Track>();

  activeTab: string = 'local';

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  openChooseModal(trackModal) {
    this.modalService.open(trackModal, { size: 'lg' }).result
      .then(result => this.trackSelected.emit(result), () => 0);

    switch (this.track.constructor.name) {
      case 'YoutubeTrack':
        this.activeTab = 'youtube';
        break;
      case 'EmptyTrack':
        break;
      case 'LocalTrack':
        this.activeTab = 'local';
        break;
    }
  }

}
