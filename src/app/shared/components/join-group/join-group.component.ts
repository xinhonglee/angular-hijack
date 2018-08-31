import {
    ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
    SimpleChanges, TemplateRef, ViewChild
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { TimerService } from '../../services/timerService';
import { MiningModalComponent } from '../popups/MiningModal';

@Component({
    selector: 'app-join-group',
    templateUrl: './join-group.component.html',
    styleUrls: ['./join-group.component.css']
})
export class JoinGroupComponent implements OnInit, OnChanges, OnDestroy {

    @Output() hideChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() hide: boolean;
    @Input() whiteTitle: boolean;
    @Input() isActive: boolean;

    @ViewChild('startMine')
    public startMine: TemplateRef<any>;

    @ViewChild('signTransaction')
    public signTransaction: TemplateRef<any>;

    ethGroup: FormGroup;
    submitted: boolean = false;

    public mm_logo = 'assets/images/METAMASK_LOGO.png';
    public mm_icon = 'assets/images/mm_icon.png';

    private isMobile;

    modalRef: BsModalRef;

    private once;

    constructor(private web3Service: Web3Service,
                private router: Router,
                private deviceService: DeviceDetectorService,
                private modalService: BsModalService,
                private timerService: TimerService) {
    }

    openModal(template: TemplateRef<any>, isMiddle = false) {
        if (isMiddle) {
            this.modalRef = this.modalService.show(MiningModalComponent, {
                class: 'modal-style'
            });
        } else {
            this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-style' }));
        }
    }

    ngOnInit() {
        const deviceInfo = this.deviceService.getDeviceInfo();
        this.isMobile = deviceInfo.userAgent.search(/Trust|Cipher/i) !== -1;
        this.ethGroup = new FormGroup({
            'ethAddress': new FormControl('', [
                Validators.required,
                this.isEthAddress(),
            ], this.existsInMatrix.bind(this)),
        });
    }

    ngOnDestroy(): void {

    }

    onSubmitSuccess() {
        if (this.isMobile) this.modalRef.hide();
        this.router.navigate(['/account']);
    }

    onMiddleCb() {
        if (!this.isMobile) this.modalRef.hide();

        if (this.once) {
            this.openModal(null, true);
        } else {
            this.timerService.destroyTimer('second');
            // this.openModal(this.signTransaction);
        }

        this.once = !this.once;
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    submit() {
        this.submitted = true;

        this.once = true;

        if (this.ethGroup.valid) {
            if (!this.isMobile) this.openModal(this.startMine);
            this.isActive = true;

            this.web3Service.onBuySubmit(this.ethAddress.value, null,
                this.onSubmitSuccess.bind(this), this.onMiddleCb.bind(this)).then(() => {
                this.isActive = false;
            }).catch((err) => {
                this.isActive = false;
                console.log('Buying spot transaction rejected', err);
            });
        }
    }

    get ethAddress() {
        return this.ethGroup.get('ethAddress');
    }

    private isEthAddress(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const isEthAddress = this.web3Service.isEthAddress(control.value);
            return isEthAddress ? null : { 'invalid': control.value };
        };
    }

    private existsInMatrix(control: AbstractControl) {
        return this.web3Service.existsInMatrix(control.value).then(result => {
            const exists = result['data'].exists === true;
            return exists ? null : { 'notInMatrix': control.value };
        });
    }

}
