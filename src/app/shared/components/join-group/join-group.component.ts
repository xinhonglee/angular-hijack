import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { Router } from '@angular/router';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  styleUrls: ['./join-group.component.css']
})
export class JoinGroupComponent implements OnInit, OnChanges {

  @Output() hideChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() hide: boolean;
  @Input() whiteTitle: boolean;

  ethGroup: FormGroup;
  submitted: boolean = false;

  constructor(private web3Service: Web3Service, private router: Router, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.ethGroup = new FormGroup({
      'ethAddress': new FormControl('', [
        Validators.required,
        this.isEthAddress(),
      ], this.existsInMatrix.bind(this)),
    });
  }

  onSubmitSuccess() {
    window.location.href = '/account';
  }

  onMiddleCb() {
    this.hideChange.emit(!this.hide);
    this.hide = !this.hide;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  submit() {
    this.submitted = true;

    if (this.ethGroup.valid) {
      this.web3Service.onBuySubmit(this.ethAddress.value, null,
        this.onSubmitSuccess.bind(this), this.onMiddleCb.bind(this));
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
    return this.web3Service.existsInMatrix(control.value)
      .then(result => {
        const exists = result['data'].exists === true;
        return exists ? null : { 'notInMatrix': control.value };
      });
  }

}
