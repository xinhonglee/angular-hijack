import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CurrencyService {

  constructor(private httpClient: HttpClient) {
  }

  ethToUsd(ethToConvert: number[]) {
    return this.fetchCurrency()
      .then((ether) => {
        return this.calculateUsd(ether, ethToConvert);
      });
  }

  fetchCurrency() {
    return this.httpClient.get('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=10')
      .toPromise()
      .then((data: any) => {
        return data.find(curr => curr.symbol === 'ETH');
      });
  }

  calculateUsd(ether, ethArray: number[]): number[] {
    return ethArray.map(eth => {
      const usd = eth * Number(ether.price_usd);

      return Math.floor(usd);
    });
  }

  spotsCounter(levels =0): number {
    let totalSpots:number = 0;

    for (let i = 1; i <= levels; i++) {
      totalSpots += Math.pow(3, i);
    }

    return totalSpots;
  }

  public async estimateReward(levels = 0, spots = 0) {
    let selectedSpots = this.spotsCounter(levels);
    let totalEthPerSlot = (selectedSpots * .1) * .08;

    const currency = await this.fetchCurrency();

    const totalEth = totalEthPerSlot * spots;
    const totalUSD = Number(currency.price_usd) * totalEth;

    return {
      eth: totalEth.toFixed(2),
      usd: Math.floor(totalUSD).toString()
    };
  }

}
