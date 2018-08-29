import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

    public logoPath;
    public icon_language;
    public icon_location;
    public icon_facebook;
    public icon_twitter;
    public icon_telegram;

  constructor() {
      this.logoPath      = 'assets/images/LOGO-BLACK.png';
      this.icon_language = 'assets/images/icon/language.svg';
      this.icon_location = 'assets/images/icon/location.svg';
      this.icon_facebook = 'assets/images/icon/facebook.svg';
      this.icon_twitter  = 'assets/images/icon/twitter.svg';
      this.icon_telegram = 'assets/images/icon/telegram.svg';

  }

  ngOnInit() {
  }

}
