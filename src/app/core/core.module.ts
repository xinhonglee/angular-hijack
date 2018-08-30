import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuySpotComponent } from './buy-spot/buy-spot.component';
import { CoreComponent } from './core/core.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../shared/shared.module';
import { ClipboardModule } from 'ngx-clipboard';
import { JoinComponent } from './join/join.component';
import { AccordionModule, ModalModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        NgxChartsModule,
        ClipboardModule,
        AccordionModule.forRoot(),
        ModalModule.forRoot()
    ],
    declarations: [BuySpotComponent, CoreComponent, HomeComponent, AccountComponent, JoinComponent]
})
export class CoreModule {
}
