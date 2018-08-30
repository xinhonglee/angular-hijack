import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { HiJack } from '../../shared/hijack/hijack';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends HiJack implements OnInit, OnDestroy {

    constructor(private httpClient: HttpClient, private ref: ChangeDetectorRef, private localstorageService: LocalStorageService) {
        super();
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

}
