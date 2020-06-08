import { Component, NgZone } from "@angular/core";
import {envVariables} from '../../environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  public appBuild: string;
  public appVersion: string;
  public username: string;
  
  
  constructor(private ngZone: NgZone) {
    this.appVersion = envVariables.VERSION;
    this.appBuild = envVariables.BUILD;  
    this.username = envVariables.USERNAME;    
  }


  

}
