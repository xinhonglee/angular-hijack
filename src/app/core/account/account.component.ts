import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { SpotsData } from '../../shared/interfaces/spots/spotsData.interface';
import { AccountStats } from '../../shared/interfaces/account/accountStats.interface';
import { CurrencyService } from '../../shared/services/currency.service';
import { Web3Service } from '../../shared/services/web3.service';
import {LocalStorageService} from "angular-2-local-storage";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  public logoPath;
  public telegramPath;

  // options
  showXAxis = true;
  showYAxis = false;
  gradient = true;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  tooltipDisabled = true;
  barPadding = 20;

  public switchUrl;
  public switchText;

  colorScheme = {
    domain: ['#6b00ff']
  };

  spots: SpotsData;

  accountStats: AccountStats;
  graph: object[];
  referralSpots: string;
  downline: string;
  token: string;

  copyText: string = 'Copy';

  public hideOverlay: boolean;

  private accountStatsDefault: AccountStats = {
    graph: [],
    today_downline: 0,
    total_downline: 0,
    today_rewards: 0,
    total_rewards: 0,
    tokens_amount: 0,
    token_price: 0,
  };

  private ether;
  private interval;
  private refreshSubscription;

  constructor(
    private httpClient: HttpClient,
    private currencyService: CurrencyService,
    private web3Service: Web3Service,
    private ref: ChangeDetectorRef,
    private localstorageService: LocalStorageService
  ) {
    this.logoPath = 'assets/images/LOGO.png';
    this.telegramPath = 'assets/images/Telegram.png';
    this.initAccountStats();

    const hasSpot = localstorageService.get('hasSpot');

    if(hasSpot) {
      this.switchUrl = '/account';
      this.switchText = 'Account';
    } else {
      this.switchUrl = '/join';
      this.switchText = 'Join';
    }
  }

  ngOnInit() {

    this.hideOverlay = true;

    this.web3Service.getCoinbase()
      .then(async (address) => {
        await this.getSpots(address);

        await this.getAccountStats(address);
      });

    this.getPriceUsd();

    this.interval = setInterval(() => {
      this.getPriceUsd();
    }, 5000);

    this.refreshSubscription = this.web3Service.dataRefresh().subscribe(async (addresses: any[]) => {
      console.log('addresses to refresh', addresses);
      const address = this.web3Service.coinbase;
      const isCoinbase = addresses.find(item => {
        return item.toLowerCase() === address.toLowerCase();
      });

      if(isCoinbase) {
        this.getSpots(address);

        this.getAccountStats(address);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  get ethAddress(): string {
    return this.web3Service.coinbase;
  }

  get todayRewards() {
    return this.getRewardString(this.accountStats.today_rewards);
  }

  get totalRewards() {
    return this.getRewardString(this.accountStats.total_rewards);
  }

  get tokenPrice() {
    return this.getTokenPriceString(this.accountStats.tokens_amount, this.accountStats.token_price);
  }

  onCopy(success = true) {
    this.copyText = success ? 'Copied' : 'Not copied';
  }

  handleHidechange(e) {
    console.log('HandleChange');
    this.hideOverlay = !this.hideOverlay;
    this.ref.detectChanges();
  }

  private getSpots(address, from = null, limit=10): void {

    let params = new HttpParams();
    if(from) {
      params = params.append('from', from);
    }
    params = params.append('limit', limit.toString());

    this.httpClient.get(`/api/${address}/spots`, {params: params})
      .subscribe((response: { type: string, data: SpotsData }) => {
        if (response.type === 'success') {
          this.spots = response.data;

          let freeSlots = null;
          this.spots.spots.map(spot => {
            freeSlots += 3 -spot.comission_tier_id;
          });

          this.spots.free_spots = freeSlots;

          this.referralSpots = `${this.spots.total_spots} (${this.spots.free_spots} slots)`;
          this.ref.detectChanges();
        } else {
          console.log('error');
        }
      })
  }

  private getPriceUsd() {
    return this.currencyService.fetchCurrency()
      .then((ether) => {
        this.ether = ether;
      });
  }

  private getAccountStats(address): void {
    this.httpClient.get(`/api/${address}/account-stats`)
      .subscribe((response: { type: string, data: AccountStats }) => {
        if (response.type === 'success') {
          this.initAccountStats(response.data);
        } else {
          console.log('error');
        }
      });
  }

  private initAccountStats(accountStats?: AccountStats): void {
    this.accountStats = this.accountStatsDefault;

    if (accountStats) {
      this.accountStats = Object.assign({}, this.accountStats, accountStats);
    }

    const { graph, total_downline, tokens_amount } = this.accountStats;

    this.graph = graph.map((item) => {
      return {
        value: item.value,
        name: item.name
      };
    });
    this.downline = `${total_downline}`;

    this.token = `${tokens_amount.toString().replace('.', ',')} SRX`;
  }

  private formatXAxis(label) {
    return label.slice(1);
  }

  private getRewardString(eth) {
    if (!this.ether) {
      return '';
    }

    return `ETH ${eth} (USD ${this.currencyService.calculateUsd(this.ether, [eth])[0]})`;
  }

  private getTokenPriceString(amount, price) {
    if (!this.ether) {
      return '';
    }

    let ethTokens: any = amount * price;
    let ethUsd: any = ethTokens * Number(this.ether.price_usd);


    ethTokens = ethTokens.toFixed(4).toString().replace('.', ',');
    ethUsd = ethUsd.toFixed(2).toString().replace('.', ',');

    return `ETH ${ ethTokens } (USD ${ ethUsd })`;
  }
}
