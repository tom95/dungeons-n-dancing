/* tslint:disable:no-unused-variable */

import {
  async,
  TestBed,
  DebugElement,
  ComponentFixture,
  ComponentFixtureAutoDetect
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DndTrackButtonComponent } from './dnd-track-button.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropboxTrack } from '../dropbox-track';

@Component({
  selector: 'dnd-track-chooser-dropbox,dnd-track-chooser-youtube,dnd-track-chooser-local,dnd-track-chooser-deezer',
  template: ''
}) class TestChooserComponent {
  @Input() track;
  @Output() created = new EventEmitter();
}

@Component({ template: '<dnd-track-button></dnd-track-button><template ngbModalContainer></template>' })
class TestHostComponent {
  @ViewChild(DndTrackButtonComponent) trackButtonComponent: any;
}

describe('Component: DndTrackButton', () => {
  let comp: DndTrackButtonComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let openButton: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        DndTrackButtonComponent,
        TestHostComponent,
        TestChooserComponent
      ],
      imports: [
        NgbModule.forRoot(),
        FormsModule
      ],
      providers: [
      ]
    )
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    comp = fixture.componentInstance.trackButtonComponent;
    comp.track = new DropboxTrack('Test Title', 'http://blah');
    fixture.detectChanges();

    openButton = fixture.debugElement.query(By.css('.btn'));
  });

  it('should create an instance', () => {
    expect(comp).toBeTruthy();
  });

  it('should display its track\'s title', () => {
    expect(fixture.debugElement.query(By.css('.track-title')).nativeElement.textContent).toEqual('Test Title');
  });

  it('should open the chooser modal on the right tab', () => {
    expect(fixture.debugElement.query(By.css('.modal'))).toBeNull();
    openButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.modal'))).not.toBeNull();
    expect(comp.activeTab).toEqual('dropbox');
  });
});
