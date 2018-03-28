import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { debounce } from "../../shared/decorators/debounce"
import { CurrencyService } from "../../shared/services/currency.service"
import { LocalStorageService } from "angular-2-local-storage"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit, OnDestroy {
  public logoPath
  public trianglesPath

  public levels

  public hideOverlay: boolean

  innerHeight: any
  innerWidth: any

  public boostCrowd
  public boostGame
  public boostRewards
  public getReferred
  public getRewards
  public getSpots

  public boostPhases
  public getPhases

  public switchUrl
  public switchText

  public firstRef = [0.01, 0.02, 0.08, 0.24, 0.73, 2.18, 6.56, 19.68, 59.05, 177.14]
  public secondRef = [0.01, 0.05, 0.16, 0.48, 1.45, 4.37, 13.12, 39.36, 118.09, 354.29]
  public thirdRef = [0.02, 0.1, 0.31, 0.96, 2.9, 8.74, 26.23, 78.72, 236.18, 708.58]

  public firstUsd = []
  public secondUsd = []
  public thirdUsd = []

  public refToDisplay: string = ""
  private interval = null

  public telegramPath
  public mBoostPhases
  public mGetPhases
  public mBoostRewards

  public levelText

  constructor(
    private httpClient: HttpClient,
    private currencyService: CurrencyService,
    private ref: ChangeDetectorRef,
    private localstorageService: LocalStorageService
  ) {
    this.logoPath = "assets/images/LOGO.svg"
    this.trianglesPath = "assets/images/TRIANGLES_HERO_IMAGE.png"

    this.boostCrowd = "assets/images/BOOST_CROWD.png"
    this.boostGame = "assets/images/BOOST_GAME.png"
    this.boostRewards = "assets/images/BOOST_REWARDS.png"
    this.mBoostRewards = "assets/images/BOOST_REWARDS_MOBILE.png"

    this.getReferred = "assets/images/GET_REFERRED.png"
    this.getRewards = "assets/images/GET_REWARDS.png"
    this.getSpots = "assets/images/GET_SPOTS.png"

    this.boostPhases = "assets/images/BOOST_PHASES.png"
    this.mBoostPhases = "assets/images/MOB_BOOST_PHASES.png"
    this.mGetPhases = "assets/images/MOB_GET_PHASES.png"

    this.getPhases = "assets/images/GET_PHASES.png"

    this.telegramPath = "assets/images/Telegram.png"

    this.innerHeight = window.screen.height
    this.innerWidth = window.screen.width

    this.refToDisplay = this.getRefToDisplay(this.innerWidth)

    this.levelText = this.getLevelText(this.innerWidth)

    const firstTime = this.localstorageService.get("firstTime")

    if (!firstTime) {
      localstorageService.remove("hasSpot")
      localstorageService.add("firstTime", {})
    }

    const hasSpot = localstorageService.get("hasSpot")

    if (hasSpot) {
      this.switchUrl = "/account"
      this.switchText = "Account"
    } else {
      this.switchUrl = "/join"
      this.switchText = "Join"
    }
  }

  public setRefToDisplay(refToDisplay: string): void {
    this.refToDisplay = refToDisplay
  }

  handleHidechange(e) {
    this.hideOverlay = !this.hideOverlay
    this.ref.detectChanges()
  }

  @HostListener("window:resize", ["$event"])
  @debounce()
  private onWindowResize(event) {
    const { innerWidth } = event.target

    this.refToDisplay = this.getRefToDisplay(innerWidth)
    this.levelText = this.getLevelText(innerWidth)
  }

  private getLevelText(innerWidth) {
    if (innerWidth < 992) {
      return "Lvl"
    } else {
      return "Level"
    }
  }

  private getRefToDisplay(innerWidth: number): string {
    if (innerWidth < 768) {
      return this.refToDisplay || "firstRef"
    } else {
      return ""
    }
  }

  private fetchCurrency() {
    this.currencyService.fetchCurrency().then(ether => {
      this.firstUsd = this.currencyService.calculateUsd(ether, this.firstRef)
      this.secondUsd = this.currencyService.calculateUsd(ether, this.secondRef)
      this.thirdUsd = this.currencyService.calculateUsd(ether, this.thirdRef)
    })
  }

  ngOnInit() {
    this.hideOverlay = true

    this.levels = Array(10)
      .fill(1, 0, 10)
      .map((x, i) => i)
    this.fetchCurrency()
    this.interval = setInterval(this.fetchCurrency(), 5000)
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
