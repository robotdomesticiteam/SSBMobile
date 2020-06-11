import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {envVariables} from '../../environments/environment';
import { NgZone  } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { NavController, NavParams } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';




@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  
  pairedDevices: any;
  gettingDevices: boolean;
  public deviceName: string;
  targa:string;
  form = {};
  bt_command = "";
  public token : string;
  public _text : string;

  // progress circle
  progress = 0;
  timerHandler: number;
  progressText = "dispositivo pronto";
  
  _headers = {'Content-Type': 'application/x-www-form-urlencoded',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'DELETE, POST, GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'};

  
  m_seconds_F1: number ;
  m_seconds_F2: number;


  constructor(private bluetoothSerial: BluetoothSerial,
              public http: HttpClient,
              private storage: Storage, 
              private alertController: AlertController,
              private tts: TextToSpeech,
              public navCtrl: NavController, 
              public navParams: NavParams,
              private zone: NgZone) {

      

    this.targa = "";

    bluetoothSerial.enable();

    // DEVICE_ID
    storage.get('deviceId').then((val) => {
      console.log('Your deviceId is', val);
      envVariables.DEVICE_ID = val;  
      this.startScanning();    
    });


    storage.get('SECONDS_FASE_1').then((val) => {
      console.log('SECONDI_FASE_1', val);
      envVariables.SECONDS_FASE_1 = val;  
    });

    storage.get('SECONDS_FASE_2').then((val) => {
      console.log('SECONDI_FASE_2', val);
      envVariables.SECONDS_FASE_2 = val;  
    });

    this.targa = "";

    storage.get('TARGA').then((val) => {
      console.log('TARGA', val);
      envVariables.TARGA = val;  
      this.targa = envVariables.TARGA;
      this.form["targa"] = this.targa;
    });    

  }

 


  async startScanning() {
    this.pairedDevices = null;
    this.gettingDevices = true;
    
    this.bluetoothSerial.list().then((success) => {
      this.pairedDevices = success;
      this.selectDevice(envVariables.DEVICE_ID);
    },
      (err) => {
  
      });
  }
  
  success = (data) => {
    this.deviceConnected();
    this.storage.set('deviceId', envVariables.DEVICE_ID);
    this.deviceName = envVariables.DEVICE_NAME;
    this.zone.run(() => {
      console.log('force update the screen');
    });    
  }
  fail = (error) => {
    alert(error);
    envVariables.DEVICE_ID = "";
  }
   

  async selectDevice(id: any) 
  {        
    var device = this.pairedDevices.filter( devices => {
      if(devices.id.includes(id)) return devices;
    })

    envVariables.DEVICE_NAME = device[0].name;    

    const alert = await this.alertController.create({
      header: 'Connessione',
      message: 'Vuoi connetterti al dispositivo '+ envVariables.DEVICE_NAME +' ?', 
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connetti',
          handler: () => {
            envVariables.DEVICE_ID = id;
            this.bluetoothSerial.connect(id).subscribe(this.success, this.fail);
          }
        }
      ]
    });
    await alert.present();
  }  

  deviceConnected() {
    this.bluetoothSerial.isConnected().then(success => {
      alert('Connessione avvenuta con ' + envVariables.DEVICE_NAME);
    }, error => {
      alert('error' + JSON.stringify(error));
    });
  }
 
  async sanifica()
  {
    this.targa = this.form['targa'];
    console.log("Targa : " + this.targa);
    this.storage.set('TARGA', this.targa);

    if(this.targa)
    {
      const alert = await this.alertController.create({
        header: 'Confermare ',
        message: 'Vuoi eseguire la sanificazione di  '+ this.targa +' ?', 
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'SI',
            handler: () => {
              // ESEGUI SANIFICAZIONE
              this.bt_command = "GO,"+ envVariables.SECONDS_FASE_1 +"," + envVariables.SECONDS_FASE_2 + "\x0a";
              this.bluetoothSerial.write(this.bt_command).then(this.success_BT, this.failure_BT);

              this._text = "Sanificazione avviata! Allontanarsi dal raggio di azione del dispositivo.";
              this.tts.speak({
                text: this._text,
                locale: 'it-IT',
                rate: 1.00
              })
              .then(() => console.log(this._text))
              .catch((reason: any) => console.log(reason));

              this.m_seconds_F1 = parseInt(envVariables.SECONDS_FASE_1) * 1000;
              this.m_seconds_F2 = parseInt(envVariables.SECONDS_FASE_2) * 1000;
              
              setTimeout(() => {this.sendPostRequest_CleaningStart()}, (8*1000));
              this.setProgressBar(0, this._text);              
            }
          }
        ]
      });
      await alert.present();
    }
    else
    {
      alert('Inserire la targa del veicolo !'); 
    }
       
  }

  success_BT = (data) => {
    console.log("comando inviato " + this.bt_command);
  }
  failure_BT = (error) => {
    alert(error);
  }

  async arresta()
  {
    this.bt_command = "ALT!" + "\x0a";
    this.bluetoothSerial.write(this.bt_command).then(this.success_BT, this.failure_BT);
    alert('Sanificazione interrotta !');
  }

  async sendPostRequest_CleaningStart() {

    this._text = "Inizio ciclo igienizzante!";
    this.setProgressBar(1, this._text);

    this.tts.speak({
      text: this._text,
      locale: 'it-IT',
      rate: 1.00
    })
    .then(() => console.log(this._text))
    .catch((reason: any) => console.log(reason));   

    this.token = new Date().toISOString().replace(':','_').replace('.','');

    
              
    let _json = { timestamp: 1234,
      idazienda : 1,
      user: 'Mario',
      asset: this.targa,
      fw: '1.2',
      hwcode : '324321',
      token: this.token + '_F1'};

    let postData =  JSON.stringify(_json);

    let ULR_CLEANING_START = envVariables.INSTANCE_URL + envVariables.CLEANING_START;    

    this.http.post(ULR_CLEANING_START, "json="+postData, { headers: this._headers })
     .subscribe(data => {
      console.log(data['_body']);
     }, error => {
      console.log(error);
    });


    setTimeout(() => {this.sendPostRequest_CleaningCompleted()}, this.m_seconds_F1);    
  }

  async sendPostRequest_CleaningCompleted() {
  
    this._text = "Fine ciclo igienizzante!";
    this.setProgressBar(49, this._text);
      this.tts.speak({
        text: this._text,
        locale: 'it-IT',
        rate: 1.00
      })
      .then(() => console.log(this._text))
      .catch((reason: any) => console.log(reason)); 
    
  
      let _json = { timestamp: 1234,
        idazienda : 1,
        user: 'Mario',
        asset: this.targa,
        fw: '1.2',
        hwcode : '324321',
        token: this.token + '_F1'};
  
      let postData =  JSON.stringify(_json);
  
      let ULR_CLEANING_STOP = envVariables.INSTANCE_URL + envVariables.CLEANING_COMPLETED;    
  
      this.http.post(ULR_CLEANING_STOP, "json="+postData, { headers: this._headers })
       .subscribe(data => {
        console.log(data['_body']);
       }, error => {
        console.log(error);
      });
      
      
      setTimeout(() => {this.sendPostRequest_DisinfectionStart()}, (5*1000));  
  }  


  async sendPostRequest_DisinfectionStart() {
  
    this._text = "Inizio ciclo disinfettante!";
    this.setProgressBar(50, this._text);

    this.tts.speak({
      text: this._text,
      locale: 'it-IT',
      rate: 1.00
    })
    .then(() => console.log(this._text))
    .catch((reason: any) => console.log(reason)); 

    let _json = { timestamp: 1234,
      idazienda : 1,
      user: 'Mario',
      asset: this.targa,
      fw: '1.2',
      hwcode : '324321',
      token: this.token + '_F2'};

    let postData =  JSON.stringify(_json);

    let ULR_DISINFECTION_START = envVariables.INSTANCE_URL + envVariables.DISINFECTION_START;    

    this.http.post(ULR_DISINFECTION_START, "json="+postData, { headers: this._headers })
     .subscribe(data => {
      console.log(data['_body']);
     }, error => {
      console.log(error);
    });

    setTimeout(() => {this.sendPostRequest_DisinfectionCompleted()}, this.m_seconds_F2);
  }  


  async sendPostRequest_DisinfectionCompleted() {
  
  this._text = "Fine ciclo disinfettante!";
  this.setProgressBar(99, this._text);

      this.tts.speak({
        text: this._text,
        locale: 'it-IT',
        rate: 1.00
      })
      .then(() => console.log(this._text))
      .catch((reason: any) => console.log(reason)); 

      let _json = { timestamp: 1234,
        idazienda : 1,
        user: 'Mario',
        asset: this.targa,
        fw: '1.2',
        hwcode : '324321',
        token: this.token + '_F2'};
  
      let postData =  JSON.stringify(_json);
  
      let ULR_DISINFECTION_STOP = envVariables.INSTANCE_URL + envVariables.DISINFECTION_COMPLETED;    
  
      this.http.post(ULR_DISINFECTION_STOP, "json="+postData, { headers: this._headers })
       .subscribe(data => {
        console.log(data['_body']);
       }, error => {
        console.log(error);
      });
      
    setTimeout(() => {this.sendPostRequest_SanificationCompleteds()}, (5*1000));

  }  


  async sendPostRequest_SanificationCompleteds() {

      this._text = "Sanificazione terminata! Areare la zona sanificata.";
      this.setProgressBar(100, this._text);

      this.tts.speak({
        text: this._text,
        locale: 'it-IT',
        rate: 1.00
      })
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));     
  }

  setProgressBar(value:number, text:string)
  {
    this.progress = value;
    this.progressText = text.split("!")[0];
    this.zone.run(() => {
      console.log('force update the screen progressbar:' + value + " - " + text) ;
    });    

  }

}
