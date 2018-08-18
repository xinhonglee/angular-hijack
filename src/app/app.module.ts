import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {CoreModule} from "./core/core.module";
import {LocalStorageModule} from "angular-2-local-storage";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser'
import {HashLocationStrategy} from "@angular/common";
import { DeviceDetectorModule } from 'ngx-device-detector';
import * as Hammer from 'hammerjs';

export class MyHammerConfig extends HammerGestureConfig{
  overrides = <any>{
    'swipe': {velocity: 0.4, threshold: 20, direction: Hammer.DIRECTION_ALL}
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    DeviceDetectorModule.forRoot(),
    LocalStorageModule.withConfig({
      prefix: 'matrix',
      storageType: 'localStorage'
    }),
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: MyHammerConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
