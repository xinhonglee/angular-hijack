import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { debounce } from '../../decorators/debounce';
import { SpotsData } from '../../interfaces/spots/spotsData.interface';
import { Web3Service } from '../../services/web3.service';
import { Spot } from '../../interfaces/spots/spot.interface';

const PERCENTAGE_MAP: { [comission_tier: string]: number } = {
  '0': 0,
  '1': 2,
  '2': 4,
  '3': 8,
};

@Component({
  selector: 'app-spots',
  templateUrl: './spots.component.html',
  styleUrls: ['./spots.component.css']
})
export class SpotsComponent implements OnChanges {

  @Input() spots: SpotsData;
  @Input() ethAddress: string = '';

  @Output() hideChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() hide: boolean;

  spotsToDisplay: Spot[] = [];

  private spotsPerView: number = 10;

  private screenWidth: number;

  public showLoader: boolean;

  constructor(private web3Service: Web3Service) {
    this.screenWidth = window.screen.width;
    this.showLoader = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('spots') && changes.spots.currentValue) {
      this.loadMoreSpots();
      this.showLoader = false;
    }
  }

  get totalSpots(): string {
    let totalSpotsText = '0';

    if (this.spots) {
      totalSpotsText = this.spots.total_spots.toString();
    }

    if (this.screenWidth > 768) {
      totalSpotsText = 'Total spots ' + totalSpotsText;
    }

    return totalSpotsText;
  }

  get freeSpots(): string {
    return this.spots ? `(${this.spots.free_spots} slots)` : '';
  }

  loadMoreSpots() {
    const { spots } = this.spots;

    if (this.spotsToDisplay.length < spots.length) {
      const sliceFrom = this.spotsToDisplay.length;
      const sliceTo = Math.min(this.spotsToDisplay.length + this.spotsPerView, spots.length);

      const newSpots = spots.slice(sliceFrom, sliceTo);

      this.spotsToDisplay = this.spotsToDisplay.concat(newSpots);

      this.spotsToDisplay = this.spotsToDisplay.map(item => {
        const spotItem  = spots.find(spot => item.id === spot.id);
        if(spotItem) {
          return spotItem;
        } else {
          return item;
        }

      })
    }
  }

  getComissionPercent(comission_tier: string): string {
    return PERCENTAGE_MAP[comission_tier] + '%';
  }

  onMiddleCb() {
    this.hideChange.emit(!this.hide);
    this.hide = !this.hide;
  }

  buyNewSpots() {
    this.web3Service.onBuySubmit(this.ethAddress, null, null, this.onMiddleCb.bind(this));
  }

  @HostListener('window:resize', ['$event'])
  @debounce()
  private onWindowResize(event): void {
    this.screenWidth = event.target.innerWidth;
  }

}
