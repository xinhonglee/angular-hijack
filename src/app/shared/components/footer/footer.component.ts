import { Component, OnInit } from '@angular/core';
import { HiJack } from '../../hijack/hijack';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends HiJack implements OnInit {

    public logoPath;
    public icon_language;
    public icon_mailbox;
    public icon_facebook;
    public icon_twitter;
    public icon_telegram;

    constructor() {
        super();
        this.logoPath = 'assets/images/LOGO-BLACK.png';
        this.icon_language = 'assets/images/icon/language.svg';
        this.icon_mailbox = 'assets/images/icon/location.svg';
        this.icon_facebook = 'assets/images/icon/facebook.svg';
        this.icon_twitter = 'assets/images/icon/twitter.svg';
        this.icon_telegram = 'assets/images/icon/telegram.svg';
    }

    ngOnInit() {
        this.initialSections();
    }
}
