import { Component } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { Web3Service } from '../../services/web3.service';

@Component({
    selector: 'app-rewards-calculator',
    templateUrl: './rewards-calculator.component.html',
    styleUrls: ['./rewards-calculator.component.scss'],
})
export class RewardsCalculatorComponent {

    rewardsCalc = {
        totalLevels: 10,
        totalSpots: 10,
        selectedLevels: 6,
        selectedSpots: 6,
    };

    public rewardData = {
        usd: '0',
        eth: '0'
    };

    constructor(private currencyService: CurrencyService, private web3Service: Web3Service) {
        this.currencyService.estimateReward(
            this.rewardsCalc.selectedLevels,
            this.rewardsCalc.selectedSpots
        ).then((data) => {
            this.rewardData = data;
        });
    }

    isLevelSelected(spotIndex, levelIndex) {
        const { selectedSpots, totalLevels, selectedLevels } = this.rewardsCalc;

        return spotIndex < selectedSpots && levelIndex >= totalLevels - selectedLevels;
    }

    async selectLevels(levels) {
        this.rewardsCalc.selectedLevels = levels;

        this.rewardData = await this.currencyService.estimateReward(
            this.rewardsCalc.selectedLevels,
            this.rewardsCalc.selectedSpots
        );
    }

    async selectSpots(spots) {
        this.rewardsCalc.selectedSpots = spots;

        this.rewardData = await this.currencyService.estimateReward(
            this.rewardsCalc.selectedLevels,
            this.rewardsCalc.selectedSpots
        );
    }

}
