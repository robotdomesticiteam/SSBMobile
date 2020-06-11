import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormBuilder } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { NavController, NavParams } from '@ionic/angular';

import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [FormsModule, 
            BrowserModule, 
            IonicModule.forRoot(), 
            IonicStorageModule.forRoot(), 
            NgCircleProgressModule.forRoot({
              backgroundStrokeWidth: 0,
              backgroundPadding: 1,
              space: -7,
              toFixed: 0,
              outerStrokeWidth: 10,
              radius: 50,
              outerStrokeColor: 'green',
              innerStrokeWidth: 2,
              innerStrokeColor: 'blue',
              animationDuration: 500,
              animation: true,
              startFromZero: false,
              responsive: true,
              showUnits: true,
              showTitle: true,
              showSubtitle: true,
              showImage: false,
              renderOnClick: false
            }),            
            RoundProgressModule,
            HttpClientModule,
            AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,    
    HttpClient,
    NavController,
    NavParams,
    TextToSpeech,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
