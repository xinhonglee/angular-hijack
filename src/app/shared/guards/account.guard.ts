import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {Web3Service} from "../services/web3.service";

@Injectable()
export class AccountGuard implements CanActivate {

  constructor(private web3Service: Web3Service, private router: Router) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.web3Service.onWeb3Bootstraped
      .then(() => {
        let currAddress = this.web3Service.coinbase;
        return this.web3Service.existsInMatrix(currAddress)
      })
      .then((response) => {
        return response['data'].exists;
      });
  }
}
