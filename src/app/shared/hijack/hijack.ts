import { debounce } from '../decorators/debounce';
import { HostListener } from '@angular/core';
import * as $ from 'jquery';

declare global {
    interface Window { hiJack: any; }
}
window.hiJack = null;

export class HiJack {

    SWIPE_ACTION = { UP: 'swipeup', DOWN: 'swipedown' };
    ANIMATE_DURATION = 300; // Scrolling Delay Time
    THROTTLE_DURATION = 1000;

    private sections = [];
    private mobileSections = [];

    initialSections() {
        this.sections = $('.box').toArray();
        this.mobileSections = $('.mobile-box').toArray();
        if (window.hiJack == null) {
            window.scrollTo(0, 0);
            // for MouseWheel variables
            window.hiJack = {
                scroll: {
                    activeSection: 0,
                    sectionCount: this.sections.length - 1,
                    isThrottled: false,
                    throttleDuration: this.THROTTLE_DURATION,
                    target: $(this.sections[0]).position().top
                },
                mobileScroll: {
                    activeSection: 0,
                    sectionCount: this.sections.length - 1,
                    isThrottled: false,
                    throttleDuration: this.THROTTLE_DURATION,
                    target: $(this.sections[0]).position().top
                }
            };
            this.setSizes();
            this.setSizesForMobile();
        }
    }

    removeHiJack() {
        if (window.hiJack != null ) {
            window.hiJack = null;
        }
    }

    swipe(action) {
        console.log('swipe', action);
        if ((action === this.SWIPE_ACTION.UP) && (window.hiJack.scroll.activeSection !== this.sections.length - 1)) {
            this.downSection();
            console.log('ARROW DOWN');
        } else if ((action === this.SWIPE_ACTION.DOWN) && (window.hiJack.scroll.activeSection !== 0)) {
            this.upSection();
            console.log('ARROW UP');
        }
    }

    mobileSwipe(action) {
        console.log('swipe', action);
        if ((action === this.SWIPE_ACTION.UP) && (window.hiJack.mobileScroll.activeSection !== this.mobileSections.length - 1)) {
            this.downSectionForMobile();
            console.log('ARROW DOWN');
        } else if ((action === this.SWIPE_ACTION.DOWN) && (window.hiJack.mobileScroll.activeSection !== 0)) {
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
        console.log('active section:', window.hiJack.scroll.activeSection);
        let positionFromTop = $(this.sections[window.hiJack.scroll.activeSection - 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        --window.hiJack.scroll.activeSection;
    }

    downSection() {
        console.log('active section:', window.hiJack.scroll.activeSection);
        let positionFromTop = $(this.sections[window.hiJack.scroll.activeSection + 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        ++window.hiJack.scroll.activeSection;
    }

    upSectionForMobile() {
        console.log('active section:', window.hiJack.scroll.activeSection);
        let positionFromTop = $(this.mobileSections[window.hiJack.mobileScroll.activeSection - 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        --window.hiJack.mobileScroll.activeSection;
    }

    downSectionForMobile() {
        console.log('active section:', window.hiJack.scroll.activeSection);
        let positionFromTop = $(this.mobileSections[window.hiJack.mobileScroll.activeSection + 1]).position().top;
        $('body, html').animate({ 'scrollTop': positionFromTop }, this.ANIMATE_DURATION);
        ++window.hiJack.mobileScroll.activeSection;
    }

    @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
        event.preventDefault();
        console.log('mouse wheel');
        if (window.hiJack.scroll.isThrottled) {
            return;
        }
        window.hiJack.scroll.isThrottled = true;
        setTimeout(function () {
            window.hiJack.scroll.isThrottled = false;
        }, window.hiJack.scroll.throttleDuration);

        if (event.wheelDelta > 0) {
            if (window.hiJack.scroll.activeSection === 0) {
                return false;
            }
            this.upSection();
            console.log('WHEELED DOWN');
        } else {
            if (window.hiJack.scroll.activeSection >= window.hiJack.scroll.sectionCount) {
                return false;
            }
            this.downSection();
            console.log('WHEELED UP');
        }

        console.log(window.hiJack.scroll.activeSection);
    }

    @HostListener('scroll', ['$event']) onScrollChrome(event: any) {
        console.log('scroll');
        event.preventDefault();
    }

    @HostListener('window:resize', ['$event']) @debounce()
    private onWindowResize(event) {
        this.removeHiJack();
        this.initialSections();
    }
}
