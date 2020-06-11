import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {envVariables} from '../../environments/environment';
import { NgZone  } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  
  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: boolean;
  public deviceName: string;

  constructor(private bluetoothSerial: BluetoothSerial,
              private storage: Storage, 
              private zone: NgZone,
              private alertController: AlertController) {

    bluetoothSerial.enable();

      // Or to get a key/value pair
    storage.get('deviceId').then((val) => {
      console.log('Your deviceId is', val);
      envVariables.DEVICE_ID = val;
    });
  }


  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    const unPair = [];
    this.bluetoothSerial.discoverUnpaired().then((success) => {
      success.forEach((value, key) => {
        var exists = false;
        unPair.forEach((val2, i) => {
          if (value.id === val2.id) {
            exists = true;
          }
        });
        if (exists === false && value.id !== '') {
          unPair.push(value);
        }
      });
      this.unpairedDevices = unPair;
      this.gettingDevices = false;
    },
      (err) => {
        console.log(err);
      });
  
    this.bluetoothSerial.list().then((success) => {
      this.pairedDevices = success;
    },
      (err) => {
  
      });
    }
  
    success = (data) => {
      this.deviceConnected();
      this.storage.set('deviceId', envVariables.DEVICE_ID);
      this.zone.run(() => {
        console.log('force update the screen');
      });    
    }
    fail = (error) => {
      alert(error);
      envVariables.DEVICE_ID = "";
    }

  async selectDevice(id: any) {
  
    var device = this.unpairedDevices.filter( devices => {
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

  selectedItem(id: any)
  {
    alert('Dispositivo selezionato: ' + id);
  }
  
  async disconnect() {
    const alert = await this.alertController.create({
      header: 'Disconnessione',
      message: 'Vuoi disconnetterti dal dispositivo ?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Disconnetti',
          handler: () => {
            this.bluetoothSerial.disconnect(); 

          }
        }
      ]
    });
    await alert.present();
  }  



  
}
