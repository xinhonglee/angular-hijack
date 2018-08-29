import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounce } from '../../shared/decorators/debounce';
import { CurrencyService } from '../../shared/services/currency.service';
import { LocalStorageService } from 'angular-2-local-storage';
import {Web3Service} from '../../shared/services/web3.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  SWIPE_ACTION = { UP: 'swipeup', DOWN: 'swipedown' };

  navbarOpen = false;

  public logoPath;
  public trianglesPath;

  public levels;

  public hideOverlay: boolean;

  innerHeight: any;
  innerWidth: any;

  public boostCrowd;
  public boostGame;
  public boostRewards;
  public getReferred;
  public getRewards;
  public getSpots;

  public boostPhases;
  public getPhases;

  public switchUrl;
  public switchText;

  public firstRef = [0.01, 0.02, 0.08, 0.24, 0.73, 2.18, 6.56, 19.68, 59.05, 177.14];
  public secondRef = [0.01, 0.05, 0.16, 0.48, 1.45, 4.37, 13.12, 39.36, 118.09, 354.29];
  public thirdRef = [0.02, 0.1, 0.31, 0.96, 2.9, 8.74, 26.23, 78.72, 236.18, 708.58];

  public firstUsd = [];
  public secondUsd = [];
  public thirdUsd = [];

  public refToDisplay = '';
  private interval = null;

  public telegramPath;
  public mBoostPhases;
  public mGetPhases;
  public mBoostRewards;

  public levelText;


  public conceptOverlayVisible = true;
  public rewardsOverlayVisible = true;

  private accountChangedSubscription;

  private sections = [];
  private mobileSections = [];

  private scroll = null;
  private mobileScroll = null;

  public icon_language;
  public icon_location;
  public icon_facebook;
  public icon_twitter;
  public icon_telegram;

  @ViewChild('concept') conceptVideo: any;
  @ViewChild('rewards') rewardsVideo: any;

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    event.preventDefault();
    console.log('mouse wheel');
    if (this.scroll.isThrottled) { return; }
    this.scroll.isThrottled = true;
    let _this = this;
    setTimeout(function () {
      _this.scroll.isThrottled = false;
    }, this.scroll.throttleDuration);

    if (event.wheelDelta > 0) {

      if (this.scroll.activeSection === 0) { return false; }
      this.upSection();
      console.log('WHEELED DOWN');

    } else {

      if (this.scroll.activeSection >= this.scroll.sectionCount) { return false; }
      this.downSection();
      console.log('WHEELED UP');

    }

    console.log(this.scroll.activeSection);
  }

  @HostListener('scroll', ['$event']) onScrollChrome(event: any) {
    console.log('scroll');
    event.preventDefault();
  }

  onOverlayClick(video) {
    if (video === 'concept') {
      this.conceptOverlayVisible = false;
      this.conceptVideo.nativeElement.play();
    } else if (video === 'rewards') {
      this.rewardsOverlayVisible = false;
      this.rewardsVideo.nativeElement.play();
    }
  }

  constructor(
    private httpClient: HttpClient,
    private currencyService: CurrencyService,
    private ref: ChangeDetectorRef,
    private localstorageService: LocalStorageService,
    private web3Service: Web3Service
  ) {
    this.logoPath = 'assets/images/LOGO-BLACK.png';
    this.trianglesPath = 'assets/images/TRIANGLES_HERO_IMAGE.png';

    this.boostCrowd = 'assets/images/BOOST_CROWD.png';
    this.boostGame = 'assets/images/BOOST_GAME.png';
    this.boostRewards = 'assets/images/BOOST_REWARDS.png';
    this.mBoostRewards = 'assets/images/BOOST_REWARDS_MOBILE.png';

    this.getReferred = 'assets/images/GET_REFERRED.png';
    this.getRewards = 'assets/images/GET_REWARDS.png';
    this.getSpots = 'assets/images/GET_SPOTS.png';

    this.boostPhases = 'assets/images/BOOST_PHASES.png';
    this.mBoostPhases = 'assets/images/MOB_BOOST_PHASES.png';
    this.mGetPhases = 'assets/images/MOB_GET_PHASES.png';

    this.getPhases = 'assets/images/GET_PHASES.png';

    this.telegramPath = 'assets/images/Telegram.png';

    this.icon_language = 'assets/images/icon/language.svg';
    this.icon_location = 'assets/images/icon/location.svg';
    this.icon_facebook = 'assets/images/icon/facebook.svg';
    this.icon_twitter = 'assets/images/icon/twitter.svg';
    this.icon_telegram = 'assets/images/icon/telegram.svg';

    this.innerHeight = window.screen.height;
    this.innerWidth = window.screen.width;

    this.refToDisplay = this.getRefToDisplay(this.innerWidth);

    this.levelText = this.getLevelText(this.innerWidth);

    const firstTime = this.localstorageService.get('firstTime');

    if (!firstTime) {
      localstorageService.remove('hasSpot');
      localstorageService.add('firstTime', {});
    }

  }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.hideOverlay = true;

    this.levels = Array(10)
      .fill(1, 0, 10)
      .map((x, i) => i);
    this.fetchCurrency();
    this.interval = setInterval(this.fetchCurrency(), 5000);

    this.web3Service.onWeb3Bootstraped
      .then(async () => {
        let exists = await this.web3Service.existsInMatrix(this.web3Service.coinbase);

        if (exists['data'].exists) {
          this.switchUrl = '/account';
          this.switchText = 'Account';
        } else {
          this.switchUrl = '/join';
          this.switchText = 'Join';
        }
      });

    this.accountChangedSubscription = this.web3Service.onWeb3AccountChange.subscribe(async (changed) => {
      if (changed) {
        let exists = await this.web3Service.existsInMatrix(this.web3Service.coinbase);

        if (exists['data'].exists) {
          this.switchUrl = '/account';
          this.switchText = 'Account';
        } else {
          this.switchUrl = '/join';
          this.switchText = 'Join';
        }
      }
    });

    // for MouseWheel variables

    this.sections = $('.box').toArray();
    console.log($('.box'));
    console.log($('.one').html());
    this.setSizes();

    this.scroll = {
      activeSection: 0,
      sectionCount: this.sections.length - 1,
      isThrottled: false,
      throttleDuration: 1000,
      target: $(this.sections[0]).position().top
    };

    this.mobileSections = $('.mobile-box').toArray();
    this.setSizesForMobile();
    this.mobileScroll = {
      activeSection: 0,
      sectionCount: this.sections.length - 1,
      isThrottled: false,
      throttleDuration: 1000,
      target: $(this.sections[0]).position().top
    };

  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  swipe(action) {
    console.log('swipe', action);
    if ((action === this.SWIPE_ACTION.UP) && (this.scroll.activeSection !== this.sections.length - 1) ) {

      this.downSection();
      console.log('ARROW DOWN');

    } else if ((action === this.SWIPE_ACTION.DOWN) && (this.scroll.activeSection !== 0)) {

      this.upSection();
      console.log('ARROW UP');

    }
  }

  mobileSwipe(action) {
    console.log('swipe', action);
    if ((action === this.SWIPE_ACTION.UP) && (this.mobileScroll.activeSection !== this.mobileSections.length - 1) ) {

      this.downSectionForMobile();
      console.log('ARROW DOWN');

    } else if ((action === this.SWIPE_ACTION.DOWN) && (this.mobileScroll.activeSection !== 0)) {

      this.upSectionForMobile();
      console.log('ARROW UP');

    }
  }

  setSizes() {
    for (let i = 0; i < this.sections.length; i++) {

      $(this.sections[i]).css({
        'top' : window.innerHeight * i,
        'height' : window.innerHeight,
        'width' : window.innerWidth
      });
    }

    console.log(this.sections);
  }

  setSizesForMobile() {
    for (let i = 0; i < this.mobileSections.length; i++) {

      $(this.mobileSections[i]).css({
        'top' : window.innerHeight * i,
        'height' : window.innerHeight,
        'width' : window.innerWidth
      });
    }

    console.log(this.sections);
  }

  upSection() {
    let positionFromTop = $(this.sections[this.scroll.activeSection - 1]).position().top;
    $('body, html').animate({ 'scrollTop': positionFromTop }, 300);
    --this.scroll.activeSection;
  }

  downSection() {
    let positionFromTop = $(this.sections[this.scroll.activeSection + 1]).position().top;
    $('body, html').animate({ 'scrollTop': positionFromTop }, 300);
    ++this.scroll.activeSection;
  }

  upSectionForMobile() {
    let positionFromTop = $(this.mobileSections[this.mobileScroll.activeSection - 1]).position().top;
    $('body, html').animate({ 'scrollTop': positionFromTop }, 300);
    --this.mobileScroll.activeSection;
  }

  downSectionForMobile() {
    let positionFromTop = $(this.mobileSections[this.mobileScroll.activeSection + 1]).position().top;
    $('body, html').animate({ 'scrollTop': positionFromTop }, 300);
    ++this.mobileScroll.activeSection;
  }

  public setRefToDisplay(refToDisplay: string): void {
    this.refToDisplay = refToDisplay;
  }

  handleHidechange(e) {
    this.hideOverlay = !this.hideOverlay;
    this.ref.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  @debounce()
  private onWindowResize(event) {
    const { innerWidth } = event.target;
    this.refToDisplay = this.getRefToDisplay(innerWidth);
    this.levelText = this.getLevelText(innerWidth);
  }

  private getLevelText(innerWidth) {
    if (innerWidth < 992) {
      return 'Lvl';
    } else {
      return 'Level';
    }
  }

  private getRefToDisplay(innerWidth: number): string {
    if (innerWidth < 768) {
      return this.refToDisplay || 'thirdRef';
    } else {
      return '';
    }
  }

  private fetchCurrency() {
    this.currencyService.fetchCurrency().then(ether => {
      this.firstUsd = this.currencyService.calculateUsd(ether, this.firstRef);
      this.secondUsd = this.currencyService.calculateUsd(ether, this.secondRef);
      this.thirdUsd = this.currencyService.calculateUsd(ether, this.thirdRef);
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
}
