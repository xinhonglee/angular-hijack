import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounce } from '../../shared/decorators/debounce';
import { LocalStorageService } from 'angular-2-local-storage';
import * as $ from 'jquery';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

    SWIPE_ACTION = { UP: 'swipeup', DOWN: 'swipedown' };
    ANIMATE_DURATION = 300; // Scrolling Delay Time
    THROTTLE_DURATION = 1000;

    private sections = [];
    private mobileSections = [];
    private scroll = null;
    private mobileScroll = null;

    constructor(private httpClient: HttpClient, private ref: ChangeDetectorRef, private localstorageService: LocalStorageService) {
        const firstTime = this.localstorageService.get('firstTime');

        if (!firstTime) {
            localstorageService.remove('hasSpot');
            localstorageService.add('firstTime', {});
        }
    }

    ngOnInit() {
        this.initialSections();
    }

    ngOnDestroy() {
        return;
    }

    initialSections() {
        window.scrollTo(0, 0);

        // for MouseWheel variables
        this.sections = $('.box').toArray();
        this.scroll = {
            activeSection: 0,
            sectionCount: this.sections.length - 1,
            isThrottled: false,
            throttleDuration: this.THROTTLE_DURATION,
            target: $(this.sections[0]).position().top
        };
        this.mobileSections = $('.mobile-box').toArray();
        this.mobileScroll = {
            activeSection: 0,
            sectionCount: this.sections.length - 1,
            isThrottled: false,
            throttleDuration: this.THROTTLE_DURATION,
            target: $(this.sections[0]).position().top
        };
        this.setSizes();
        this.setSizesForMobile();
    }

    swipe(action) {
        console.log('swipe', action);
        if ((action === this.SWIPE_ACTION.UP) && (this.scroll.activeSection !== this.sections.length - 1)) {
            this.downSection();
            console.log('ARROW DOWN');
        } else if ((action === this.SWIPE_ACTION.DOWN) && (this.scroll.activeSection !== 0)) {
            this.upSection();
            console.log('ARROW UP');
        }
    }

    mobileSwipe(action) {
        console.log('swipe', action);
        if ((action === this.SWIPE_ACTION.UP) && (this.mobileScroll.activeSection !== this.mobileSections.length - 1)) {
            this.downSectionForMobile();
            console.log('ARROW DOWN');
        } else if ((action === this.SWIPE_ACTION.DOWN) && (this.mobileScroll.activeSection !== 0)) {
            this.upSectionForMobile();
            console.log('ARROW UP');
        }
    }

    setSizes() {
        for (let i = 0; i < this.sections.length; i++) {
            $(this.sections[i]).css({ 'top': window.innerHeight * i, 'height': window.innerHeight, 'width': window.innerWidth });
        }
    }

    setSizesForMobile() {
        for (let i = 0; i < this.mobileSections.length; i++) {
            $(this.mobileSections[i]).css({ 'top': window.innerHeight * i, 'height': window.innerHeight, 'width': window.innerWidth });
        }
    }

    upSection() {
        let positionFromTop = $(this.sections[this.scroll.activeSection - 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        --this.scroll.activeSection;
    }

    downSection() {
        let positionFromTop = $(this.sections[this.scroll.activeSection + 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        ++this.scroll.activeSection;
    }

    upSectionForMobile() {
        let positionFromTop = $(this.mobileSections[this.mobileScroll.activeSection - 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        --this.mobileScroll.activeSection;
    }

    downSectionForMobile() {
        let positionFromTop = $(this.mobileSections[this.mobileScroll.activeSection + 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        ++this.mobileScroll.activeSection;
    }

    @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
        event.preventDefault();
        console.log('mouse wheel');
        if (this.scroll.isThrottled) {
            return;
        }
        this.scroll.isThrottled = true;
        let _this = this;
        setTimeout(function () {
            _this.scroll.isThrottled = false;
        }, this.scroll.throttleDuration);

        if (event.wheelDelta > 0) {
            if (this.scroll.activeSection === 0) {
                return false;
            }
            this.upSection();
            console.log('WHEELED DOWN');
        } else {
            if (this.scroll.activeSection >= this.scroll.sectionCount) {
                return false;
            }
            this.downSection();
            console.log('WHEELED UP');
        }

        console.log(this.scroll.activeSection);
    }

    @HostListener('scroll', ['$event']) onScrollChrome(event: any) {
        console.log('scroll');
        event.preventDefault();
    }

    @HostListener('window:resize', ['$event']) @debounce()
    private onWindowResize(event) {
        this.initialSections();
    }

}
