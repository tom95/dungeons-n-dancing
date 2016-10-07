/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import {Websocket} from './websocket';

describe('Websocket', () => {
  it('should create an instance', () => {
    expect(new Websocket()).toBeTruthy();
  });
});
