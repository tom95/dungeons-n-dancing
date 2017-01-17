import {
  Component,
  Injectable,
  OnInit,
  Input,
  Pipe,
  PipeTransform
} from '@angular/core';

interface IMusicFile {
  parent: IMusicFile;
  name: string;
  shown: boolean;
  isDirectory: boolean;
}

@Component({
  selector: 'dnd-music-file',
  template: ` <a href="#" (click)="select(file)" [textContent]="file.name"></a>
  <ul [style.height]="file.shown ? 'auto' : 0">
    <li *ngFor="let file of files | showOnlyOpenFolders">
      <dnd-music-file [files]="file.files"></dnd-music-file>
    </li>
  <ul>`,
  // FIXME directives: [MusicFile]
})
export class MusicFileComponent {
  @Input() files: Array<IMusicFile>;

  select(file: IMusicFile) {
    if (file.isDirectory) {
      file.shown = true;
    }
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
  selector: 'dnd-track-chooser-local',
  templateUrl: './track-chooser-local.component.html',
  styleUrls: ['./track-chooser-local.component.scss']
})
export class TrackChooserLocalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
