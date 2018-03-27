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

}
