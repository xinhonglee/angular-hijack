import {
    ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
    SimpleChanges, TemplateRef, ViewChild
} from '@angular/core';
import { debounce } from '../../decorators/debounce';
import { SpotsData } from '../../interfaces/spots/spotsData.interface';
import { Web3Service } from '../../services/web3.service';
import { Spot } from '../../interfaces/spots/spot.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LocalStorageService } from 'angular-2-local-storage';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MiningModalComponent } from '../popups/MiningModal';

const PERCENTAGE_MAP: { [comission_tier: string]: number } = {
    '0': 0,
    '1': 2,
    '2': 4,
    '3': 8,
};

@Component({
    selector: 'app-spots',
    templateUrl: './spots.component.html',
    styleUrls: ['./spots.component.scss']
})
export class SpotsComponent implements OnInit, OnChanges {

    @Input() spots: SpotsData;
    @Input() ethAddress: string = '';

    @Output() hideChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() hide: boolean;

    @ViewChild('startMine')
    public startMine: TemplateRef<any>;

    @ViewChild('mineInProgress')
    public mineInProgress: TemplateRef<any>;

    @ViewChild('signTransaction')
    public signTransaction: TemplateRef<any>;

    @ViewChild('purchaseSuccess')
    public purchaseSuccess: TemplateRef<any>;

    spotsToDisplay: Spot[] = [];

    private spotsPerView: number = 1000;

    private screenWidth: number;

    public showLoader: boolean;

    public spotsDisabled: boolean;

    public mm_logo = 'assets/images/METAMASK_LOGO.png';
    public mm_icon = 'assets/images/mm_icon.png';
    public so_logo = 'assets/images/LOGO-BLACK.png';

    @ViewChild('nommTemplate')
    public nommTemplate: TemplateRef<any>;

    @ViewChild('unlockmmTemplate')
    public unlockmmTemplate: TemplateRef<any>;

    private once;

    public isMobileSelected;

    private isMobile;

    modalRef: BsModalRef;

    openModal(template: TemplateRef<any>, isMiddle = false) {
        if (isMiddle) {
            this.modalRef = this.modalService.show(MiningModalComponent, {
                class: 'modal-style'
            });
        } else {
            this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-style' }));
        }
    }

    constructor(private web3Service: Web3Service,
                private ref: ChangeDetectorRef,
                private deviceService: DeviceDetectorService,
                private modalService: BsModalService,
                private localStorageService: LocalStorageService) {
        this.screenWidth = window.screen.width;
        this.showLoader = false;
        this.spotsDisabled = false;
    }

    ngOnInit(): void {
        const deviceInfo = this.deviceService.getDeviceInfo();
        this.isMobile = deviceInfo.userAgent.search(/Trust|Cipher/i) !== -1;

        this.web3Service.onWeb3Bootstraped.then(() => {

            if (!this.web3Service.isMetamaskConnected) {
                this.openModal(this.nommTemplate);
                this.spotsDisabled = true;
            } else if (!this.web3Service.isMetamaskUnlocked) {
                this.openModal(this.unlockmmTemplate);
                this.spotsDisabled = true;
                this.ref.detectChanges();
            } else {
                const pendingTx: any = this.localStorageService.get('pendingTx');
                if (pendingTx) this.buyNewSpots();
            }

        });
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
        return this.spots ? `(${this.spots.free_spots} free slots)` : '';
    }

    loadMoreSpots() {
        const { spots } = this.spots;
        this.spotsToDisplay = spots;

        this.spotsToDisplay = this.spotsToDisplay.map(item => {
            const spotItem = spots.find(spot => item.id === spot.id);
            if (spotItem) {
                return spotItem;
            } else {
                return item;
            }

        });
    }

    getComissionPercent(comission_tier: string): string {
        return PERCENTAGE_MAP[comission_tier] + '%';
    }

    onMiddleCb() {
        if (this.once) {
            if (!this.isMobile) this.modalRef.hide();
            this.openModal(null, true);
        } else {
            this.modalRef.hide();
            // this.openModal(this.purchaseSuccess);
        }

        this.once = !this.once;
    }

    buyNewSpots() {
        this.spotsDisabled = true;

        if (!this.isMobile) this.openModal(this.startMine);
        this.once = true;

        this.web3Service.onBuySubmit(this.ethAddress, null, null, this.onMiddleCb.bind(this)).then(() => {
            this.spotsDisabled = false;

            this.spotsToDisplay.push({
                id: this.spotsToDisplay.length - 1,
                _id: (this.spotsToDisplay.length - 1).toString(),
                comission_tier_id: 0
            });

        }).catch((err) => {
            this.spotsDisabled = false;
            console.log('Buying spot transaction rejected', err);
        });
    }

    @HostListener('window:resize', ['$event'])
    @debounce()
    private onWindowResize(event): void {
        this.screenWidth = event.target.innerWidth;
    }

}
