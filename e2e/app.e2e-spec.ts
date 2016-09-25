import { DungeonsNDancingPage } from './app.po';

describe('dungeons-n-dancing App', function() {
  let page: DungeonsNDancingPage;

  beforeEach(() => {
    page = new DungeonsNDancingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
