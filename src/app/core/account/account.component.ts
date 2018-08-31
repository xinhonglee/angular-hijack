import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SpotsData } from '../../shared/interfaces/spots/spotsData.interface';
import { AccountStats } from '../../shared/interfaces/account/accountStats.interface';
import { CurrencyService } from '../../shared/services/currency.service';
import { Web3Service } from '../../shared/services/web3.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
    public logoPath;
    public telegramPath;
    public ethBtn;

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

    public connectionsCount: number = 0;
    public activeCount: number = 0;
    public allowedUnilevel: number = 0;

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
        token_price: 0
    };

    private ether;
    private interval;
    private sockInterval;
    private refreshSubscription;

    private weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    private monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    public dateString;
    public showText = true;

    private accountChangedSubscription;

    constructor(private httpClient: HttpClient,
                private currencyService: CurrencyService,
                private web3Service: Web3Service,
                private ref: ChangeDetectorRef,
                private localstorageService: LocalStorageService,
                private router: Router) {
        this.logoPath = 'assets/images/LOGO.png';
        this.telegramPath = 'assets/images/Telegram.png';
        this.ethBtn = 'assets/images/ETH_btn.png';
        this.initAccountStats();
        this.ngOnInit();

        const d = new Date();

        this.dateString =
            `${this.weekday[d.getDay()]}, ${this.monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;


        this.web3Service.onWeb3Bootstraped.then(async () => {

            let exists = await this.web3Service.existsInMatrix(this.web3Service.coinbase);
            if (exists['data'].exists) {
                this.switchUrl = '/account';
                this.switchText = 'Account';
            } else {
                this.switchUrl = '/join';
                this.switchText = 'Join';
            }

        });
    }

    ngOnInit() {
        window.scrollTo(0, 0);

        this.hideOverlay = true;
        this.web3Service.getCoinbase().then(async address => {
            await this.getSpots(address);
            await this.getAccountStats(address);
            this.getConnections(address);
        });
        this.getPriceUsd();
        this.interval = setInterval(() => {
            this.getPriceUsd();
        }, 5000);


        this.sockInterval = setInterval(() => {
            if (this.web3Service.coinbase) {
                this.getSpots(this.web3Service.coinbase);
                this.getAccountStats(this.web3Service.coinbase);
            }
        }, 360 * 100);

        this.refreshSubscription = this.web3Service.dataRefresh().subscribe(async (addresses: any[]) => {
            console.log('addresses to refresh', addresses);
            const address = this.web3Service.coinbase;
            const isCoinbase = addresses.find(item => {
                return item.toLowerCase() === address.toLowerCase();
            });
            if (isCoinbase) {
                this.getSpots(address);
                this.getAccountStats(address);
            }
        });

        this.accountChangedSubscription = this.web3Service.onWeb3AccountChange.subscribe(async (changed) => {
            if (changed) {
                const exits = await this.web3Service.existsInMatrix(this.web3Service.coinbase);
                if (!exits['data'].exists) {
                    this.router.navigate(['/join']);
                } else {
                    this.getSpots(this.web3Service.coinbase);
                    this.getAccountStats(this.web3Service.coinbase);
                }
            }
        });

    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.accountChangedSubscription.unsubscribe();
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
        this.hideOverlay = !this.hideOverlay;
        this.ref.detectChanges();
    }

    private getSpots(address, from = null, limit = 10): void {
        let params = new HttpParams();
        if (from) {
            params = params.append('from', from);
        }
        params = params.append('limit', limit.toString());

        this.httpClient.get(`/api/${address}/spots`, { params: params }).subscribe((response: { type: string; data: SpotsData }) => {
            if (response.type === 'success') {
                this.spots = response.data;

                let freeSlots = null;
                this.spots.spots.map(spot => {
                    freeSlots += 3 - spot.comission_tier_id;
                });

                this.spots.free_spots = freeSlots;

                this.referralSpots = `${this.spots.total_spots} (${this.spots.free_spots} free slots)`;
                this.ref.detectChanges();
            } else {
                console.log('error');
            }
        });
    }

    private getPriceUsd() {
        return this.currencyService.fetchCurrency().then(ether => {
            this.ether = ether;
        });
    }

    private getAccountStats(address): void {
        this.httpClient.get(`/api/${address}/account-stats`).subscribe((response: { type: string; data: AccountStats }) => {
            if (response.type === 'success') {
                this.initAccountStats(response.data);
            } else {
                console.log('error');
            }
        });
    }

    private getConnections(address): void {
        this.httpClient.get(`/api/${address}/unilevel-data`).subscribe((result: { err: string, data: any }) => {
            if (!result.err) {
                this.connectionsCount = result.data.children.length;
                this.activeCount = result.data.activeCount;
                this.allowedUnilevel = result.data.currentDepth;
            } else {
                console.error('Error while fetching connections data!');
            }
        });
    }

    private initAccountStats(accountStats?: AccountStats): void {
        this.accountStats = this.accountStatsDefault;

        if (accountStats) {
            this.accountStats = Object.assign({}, this.accountStats, accountStats);
        }

        if (accountStats && this.accountStats.tokens_amount === 0) {
            this.showText = false;
        }

        const { graph, total_downline, tokens_amount } = this.accountStats;

        this.graph = graph.map(item => {
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

        let curr: number = this.currencyService.calculateUsd(this.ether, [eth])[0];

        let currstr = curr.toFixed(2).replace('.', ',');

        return `ETH ${eth} (USD ${currstr})`;
    }

    private getTokenPriceString(amount, price) {
        if (!this.ether) {
            return '';
        }

        let ethTokens: any = amount * price;
        let ethUsd: any = ethTokens * Number(this.ether.price_usd);

        ethTokens = ethTokens.toFixed(4).toString().replace('.', ',');
        ethUsd = ethUsd.toFixed(2).toString().replace('.', ',');

        return `ETH ${ethTokens} (USD ${ethUsd})`;
    }
}
