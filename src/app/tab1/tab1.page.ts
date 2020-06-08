import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {envVariables} from '../../environments/environment';
import { NgZone  } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

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

  constructor(private bluetoothSerial: BluetoothSerial,
              private storage: Storage, 
              private alertController: AlertController,
              private tts: TextToSpeech,
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

              this.tts.speak({
                text: "Sanificazione avviata! Allontanarsi dal raggio di azione del dispositivo.",
                locale: 'it-IT',
                rate: 1.00
            })
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));            }
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

}
