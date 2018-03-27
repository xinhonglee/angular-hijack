import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from "./services/web3.service";
import {WindowRef} from "./utils/WindowRef";
import {HttpClientModule} from "@angular/common/http";
import {ReplaceString} from "./utils/replaceString";
import { JoinGroupComponent } from './components/join-group/join-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimesPipe } from './pipes/times/times.pipe';
import { SpotsComponent } from './components/spots/spots.component';
import { CurrencyService } from './services/currency.service';
import { OverlayComponent } from "./components/overlay/overlay.component";
import { LoaderComponent } from './components/loader/loader.component';
import { NavigationComponent } from './components/navigation/navigation.component';

@NgModule({
  exports: [
    ReplaceString,
    JoinGroupComponent,
    SpotsComponent,
    OverlayComponent,
    LoaderComponent,
    NavigationComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ReplaceString,
    JoinGroupComponent,
    TimesPipe,
    SpotsComponent,
    OverlayComponent,
    LoaderComponent,
    NavigationComponent,
  ],
  providers: [
    Web3Service,
    WindowRef,
    CurrencyService,
  ],
})
export class SharedModule { }
