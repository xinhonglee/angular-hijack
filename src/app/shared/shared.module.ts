import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './services/web3.service';
import { WindowRef } from './utils/WindowRef';
import { HttpClientModule } from '@angular/common/http';
import { ReplaceString } from './utils/replaceString';
import { JoinGroupComponent } from './components/join-group/join-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimesPipe } from './pipes/times/times.pipe';
import { SpotsComponent } from './components/spots/spots.component';
import { CurrencyService } from './services/currency.service';
import { OverlayComponent } from './components/overlay/overlay.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { RewardsCalculatorComponent } from './components/rewards-calculator/rewards-calculator.component';
import { TimerService } from './services/timerService';
import { MiningModalComponent } from './components/popups/MiningModal';
import { AccountGuard } from './guards/account.guard';
import { RouterModule } from '@angular/router';

@NgModule({
    exports: [
        ReplaceString,
        JoinGroupComponent,
        SpotsComponent,
        OverlayComponent,
        LoaderComponent,
        TimesPipe,
        NavigationComponent,
        FooterComponent,
        RewardsCalculatorComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule
    ],
    declarations: [
        ReplaceString,
        JoinGroupComponent,
        TimesPipe,
        SpotsComponent,
        OverlayComponent,
        LoaderComponent,
        NavigationComponent,
        FooterComponent,
        RewardsCalculatorComponent,
        MiningModalComponent
    ],
    providers: [
        Web3Service,
        WindowRef,
        CurrencyService,
        TimerService,
        AccountGuard
    ],
    entryComponents: [MiningModalComponent]
})
export class SharedModule {
}
