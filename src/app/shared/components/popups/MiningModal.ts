import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { TimerService } from '../../services/timerService';

@Component({
    selector: 'mining-modal',
    template: `
        <div class="modal-body">
            <div style="display: flex;justify-content: center;align-items: center; flex-flow: column">
                <img src="./../../../../assets/images/LOGO-BLACK.png" class="mm-logo" alt="">
                <div class="timer">
                    {{timer}} min
                </div>

                <h2 class="modal-text text-center">
                    Now mining your spot. <br>
                    Can take a few minutes. <br>
                    <b>Please wait.</b>
                </h2>
            </div>
        </div>
    `
})
export class MiningModalComponent implements OnInit, OnDestroy {

    public timer;
    private timerSeconds: number;
    private subscribed: boolean;

    constructor(public bsModalRef: BsModalRef,
                private timerService: TimerService,
                private ref: ChangeDetectorRef) {
        this.timerSeconds = 0;
        this.timer = '00:00';
        this.subscribed = true;
    }

    ngOnInit() {
        this.timerService.createTimer('second', 1);
        this.timerService.subscribe('second', () => {
            this.onTimerTick(1);
        });
    }

    ngOnDestroy() {
        this.subscribed = this.timerService.unsubscribe('second');
        this.ref.detach();
    }

    onTimerTick(seconds: number) {
        this.timerSeconds += seconds;
        this.timer = this.timerService.formatSeconds(this.timerSeconds);
        if (this.subscribed) {
            this.ref.detectChanges();
        }
    }
}
