import {NavController, Page, Tabs} from 'ionic-angular';

import {HomePage} from '../home/home';
import {LikedPage} from '../liked/liked';
import {AuthProvider} from "../../providers/auth-provider/auth-provider";


@Page({
  templateUrl: 'build/pages/tabs/tabs.html',
  providers: [AuthProvider]
})
export class TabsPage {
  
  public tab1Root: any;
  public tab2Root: any;
  public myTabs: Tabs;

  constructor(public nav: NavController, private authProvider: AuthProvider) {
    // set the root pages for each tab
    this.tab1Root = HomePage;
    this.tab2Root = LikedPage;
    
  }

}
