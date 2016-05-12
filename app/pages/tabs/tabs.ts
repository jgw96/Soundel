import {NavController, Page} from 'ionic-angular';
import {HomePage} from '../home/home';
import {LikedPage} from '../liked/liked';


@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  
  public tab1Root: any;
  public tab2Root: any;

  constructor(public nav: NavController) {
    // set the root pages for each tab
    this.tab1Root = HomePage;
    this.tab2Root = LikedPage;
    
  }
}
