import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent implements OnInit {

  @Input() hide: boolean;

  constructor() { }

  public ethImage = 'assets/images/ETH_3D.png';

  ngOnInit() {
  }

  onOverlayClose() {
    this.hide = true;
  }
}
