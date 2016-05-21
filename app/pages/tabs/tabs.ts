import {NavController, Page, Tabs, Platform} from 'ionic-angular';

import {HomePage} from '../home/home';
import {LikedPage} from '../liked/liked';

@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  
  public tab1Root: any;
  public tab2Root: any;
  public isMD: boolean;
  
  onPageLoaded() {
    if (this.platform.is("android")) {
      this.isMD = true;
    }
    else {
      this.isMD = false;
    }
  }

  constructor(public nav: NavController, private platform: Platform) {
    // set the root pages for each tab
    this.tab1Root = HomePage;
    this.tab2Root = LikedPage;
  }

}
