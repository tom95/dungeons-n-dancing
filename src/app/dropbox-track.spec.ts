/* tslint:disable:no-unused-variable */

import { async, inject } from '@angular/core/testing';
import {DropboxTrack} from './dropbox-track';

describe('DropboxTrack', () => {
  it('should create an instance', () => {
    expect(new DropboxTrack('test.mp3', '')).toBeTruthy();
  });

  it('should extract the basename from a filename', () => {
    expect(new DropboxTrack('test.mp3', '').title()).toBe('test');
  });
});
