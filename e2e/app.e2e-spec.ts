import { EdgeGuiPage } from './app.po';

describe('edge-gui App', () => {
  let page: EdgeGuiPage;

  beforeEach(() => {
    page = new EdgeGuiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
