import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { ChangeDetectorRef } from '@angular/core';
import { Web3Service } from '../../shared/services/web3.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {

    @ViewChild('nommTemplate')
    public nommTemplate: TemplateRef<any>;

    @ViewChild('unlockmmTemplate')
    public unlockmmTemplate: TemplateRef<any>;

    public logoPath = 'assets/images/LOGO.svg';
    public logoPath1 = 'assets/images/LOGO.png';

    public switchUrl;
    public switchText;
    public mm_logo = 'assets/images/METAMASK_LOGO.png';
    public mm_icon = 'assets/images/mm_icon.png';

    public wallet = 'assets/images/PREPARE_WALLET.png';
    public paySpot = 'assets/images/PAY_YOUR_SPOT.png';
    public friends = 'assets/images/REFER_FRIENDS.png';

    public isBuyActive: boolean;
    public hideOverlay: boolean;

    private accountChangedSubscription;

    public isMobileSelected;
    modalRef: BsModalRef;

    openModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-style' }));
    }

    public conceptOverlayVisible = true;
    public rewardsOverlayVisible = true;

    @ViewChild('concept') conceptVideo: any;
    @ViewChild('rewards') rewardsVideo: any;

    onOverlayClick(video) {
        if (video === 'concept') {
            this.conceptOverlayVisible = false;
            this.conceptVideo.nativeElement.play();
        } else if (video === 'rewards') {
            this.rewardsOverlayVisible = false;
            this.rewardsVideo.nativeElement.play();
        }
    }

    constructor(private localstorageService: LocalStorageService, private ref: ChangeDetectorRef,
                private web3Service: Web3Service,
                private modalService: BsModalService) {
        this.isMobileSelected = true;
        this.hideOverlay = true;
        this.isBuyActive = false;
    }

    onTextToggle(selected: boolean) {
        this.isMobileSelected = selected;
    }

    handleHidechange(e) {
        this.hideOverlay = !this.hideOverlay;
        this.ref.detectChanges();
    }

    ngOnInit() {
        window.scrollTo(0, 0);

        this.web3Service.onWeb3Bootstraped.then(async () => {
            let exists = await this.web3Service.existsInMatrix(this.web3Service.coinbase);

            if (exists['data'].exists) {
                this.switchUrl = '/account';
                this.switchText = 'Account';
            } else {
                this.switchUrl = '/join';
                this.switchText = 'Join';
            }

            if (!this.web3Service.isMetamaskConnected) {
                this.openModal(this.nommTemplate);
                this.isBuyActive = true;
            } else if (!this.web3Service.isMetamaskUnlocked) {
                this.openModal(this.unlockmmTemplate);
                this.isBuyActive = true;
                this.ref.detectChanges();
            }

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
        });
    }

    ngOnDestroy() {
        this.accountChangedSubscription.unsubscribe();
    }

}
