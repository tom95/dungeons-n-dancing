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

interface IMusicFile {
  parent: IMusicFile;
  name: string;
  shown: boolean;
  isDirectory: boolean;
}

@Component({
  selector: 'music-file',
  template: ` <a href="#" (click)="select(file)" [textContent]="file.name"></a>
  <ul [style.height]="file.shown ? 'auto' : 0">
    <li *ngFor="let file of files | showOnlyOpenFolders">
      <music-file [files]="file.files"></music-file>
    </li>
  <ul>`,
  // FIXME directives: [MusicFile]
})
export class MusicFile {
  @Input() files: Array<IMusicFile>;

  select(file: IMusicFile) {
    if (file.isDirectory)
      file.shown = true;
    // TODO else
  }
}

@Pipe({
  name: 'showOnlyOpenFolders',
  pure: false
})
@Injectable()
export class OpenMusicFolders implements PipeTransform {
  transform(items: IMusicFile[], args: any[]): any {
    return items.filter(item => item.parent.shown);
  }
}

@Component({
  selector: 'dnd-track-button',
  templateUrl: './dnd-track-button.component.html',
  styles: []
})
export class DndTrackButtonComponent implements OnInit {

  @Input() track : Track;
  @Output() trackSelected = new EventEmitter<Track>();
  @Output() trackDeleted = new EventEmitter<Track>();

  dialogOpen: boolean = false;
  activeTab: string = 'local';

  youtubeUrl: string;
  youtubeTitle: string;
  youtubeStart: string;
  youtubeEnd: string;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  remove() {
    this.trackDeleted.emit(this.track);
  }

  choose(trackModal) {
    this.modalService.open(trackModal, { size: 'lg' }).result.then(result => {
      switch (result) {
        case 'youtube':
          this.addYoutube();
          break;
      }
    }, reason => {
    });

    if (chrome.storage)
      this.loadLocalTracks();

    switch (this.track.constructor.name) {
      case 'YoutubeTrack':
        let t = this.track as YoutubeTrack;
        this.youtubeTitle = t.ytTitle;
        this.youtubeUrl = t.url;
        this.youtubeStart = t.start < 0 ? undefined : t.start.toString();
        this.youtubeEnd = t.end < 0 ? undefined : t.end.toString();
        this.activeTab = 'youtube';
        break;
      case 'EmptyTrack':
        break;
      case 'LocalTrack':
        this.activeTab = 'local';
        break;
    }
  }

  addYoutube() {
    let ytTrack = new YoutubeTrack(this.youtubeUrl, this.youtubeStart, this.youtubeEnd, this.youtubeTitle);
    this.youtubeUrl = '';
    this.youtubeTitle = '';
    this.youtubeStart = undefined;
    this.youtubeEnd = undefined;

    this.trackSelected.emit(ytTrack);
  }

  loadLocalTracks() {
    console.log(chrome);
  }

}
