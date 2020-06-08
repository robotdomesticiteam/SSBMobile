import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {envVariables} from '../../environments/environment';
import { NgZone  } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  form = {};
  fase_1 = "";
  fase_2 = "";
  
  constructor(private storage: Storage, 
              private alertController: AlertController,
              private zone: NgZone) {    

    this.fase_1 = "";
    this.fase_2 = "";

    storage.get('SECONDS_FASE_1').then((val) => {
      console.log('SECONDI_FASE_1', val);
      envVariables.SECONDS_FASE_1 = val;  
      this.fase_1 = envVariables.SECONDS_FASE_1;
      this.form["fase_1"] = this.fase_1;
    });

    storage.get('SECONDS_FASE_2').then((val) => {
      console.log('SECONDI_FASE_2', val);
      envVariables.SECONDS_FASE_2 = val;  
      this.fase_2 = envVariables.SECONDS_FASE_2;
      this.form["fase_2"] = this.fase_2;
    });    

  }


  conferma()
  {
    this.fase_1 = this.form['fase_1'];    
    envVariables.SECONDS_FASE_1 = this.fase_1;
    this.storage.set('SECONDS_FASE_1', envVariables.SECONDS_FASE_1);

    this.fase_2 = this.form['fase_2'];
    envVariables.SECONDS_FASE_2 = this.fase_2;
    this.storage.set('SECONDS_FASE_2', envVariables.SECONDS_FASE_2);

    alert('Configurazione salvata !');
  }


}
