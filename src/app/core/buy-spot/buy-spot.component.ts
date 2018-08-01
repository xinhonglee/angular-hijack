import { Component, Input, OnInit } from "@angular/core"
import { FormControl, FormGroup } from "@angular/forms"
import { BuySpotRequest } from "../../shared/models/BuySpotRequest"
import { Web3Service } from "../../shared/services/web3.service"
import { LocalStorageService } from "angular-2-local-storage"
import { ChangeDetectorRef } from "@angular/core"

@Component({
  selector: "app-buy-spot",
  templateUrl: "./buy-spot.component.html",
  styleUrls: ["./buy-spot.component.scss"]
})
export class BuySpotComponent implements OnInit {
  public transactionUrl: string;

  public buyForm: FormGroup;
  private buyObject: BuySpotRequest;

  constructor(private web3Service: Web3Service, private ref: ChangeDetectorRef) {
    this.buyObject = new BuySpotRequest();
    this.buyObject.parent = parent ? parent["address"] : "";
  }

  get isMetamaskConnected(): boolean {
    return this.web3Service.isMetamaskConnected;
  }

  get isMetamaskUnlocked(): boolean {
    return this.web3Service.isMetamaskUnlocked;
  }

  isEthAddress() {
    let web3Service = this.web3Service;

    return (input: FormControl) => {
      let isAddressValid = false;
      if (web3Service) {
        isAddressValid = web3Service.isEthAddress(input.value);
      }

      return isAddressValid
        ? null
        : {
            isEthAddress: false
          }
    }
  }

  ngOnInit() {
    this.buyForm = new FormGroup({
      parent: new FormControl(this.buyObject.parent, this.isEthAddress())
    })
  }

  onSend(transactionUrl) {
    this.transactionUrl = transactionUrl;
    this.ref.detectChanges();
  }

  onSubmit() {
    if (this.buyForm.valid) {
      this.web3Service.onBuySubmit(this.buyForm.value.parent, this.onSend);
    }
  }
}
