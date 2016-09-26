import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DndTrackButtonComponent } from './dnd-track-button/dnd-track-button.component';
import { PlaylistSelectorComponent } from './playlist-selector/playlist-selector.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrackChooserYoutubeComponent } from './track-chooser-youtube/track-chooser-youtube.component';
import { TrackChooserLocalComponent } from './track-chooser-local/track-chooser-local.component';
import { TrackChooserDropboxComponent, DropboxFile, DropboxService } from './track-chooser-dropbox/track-chooser-dropbox.component';

@NgModule({
  declarations: [
    AppComponent,
    DndTrackButtonComponent,
    PlaylistSelectorComponent,
    TrackChooserYoutubeComponent,
    TrackChooserLocalComponent,
    TrackChooserDropboxComponent,
    DropboxFile
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule
  ],
  providers: [
    DropboxService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
