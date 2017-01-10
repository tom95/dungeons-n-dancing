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
import { TrackChooserDeezerComponent, DeezerService } from './track-chooser-deezer/track-chooser-deezer.component';
import { PlaybackManager } from './playback-manager';
import { RemoteComponent } from './remote/remote.component';
import { routing } from './app.routing';
import { PlayerComponent } from './player/player.component';
import { PlaylistStorage } from './playlist-storage';
import { Websocket } from './websocket';

@NgModule({
  declarations: [
    AppComponent,
    DndTrackButtonComponent,
    PlaylistSelectorComponent,
    TrackChooserYoutubeComponent,
    TrackChooserLocalComponent,
    TrackChooserDropboxComponent,
    TrackChooserDeezerComponent,
    DropboxFile,
    RemoteComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule,
    routing
  ],
  providers: [
    DropboxService,
    DeezerService,
    PlaybackManager,
    PlaylistStorage,
    Websocket
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
