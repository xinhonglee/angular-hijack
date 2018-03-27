import {Injectable} from "@angular/core";
import {WindowRef} from '../utils/WindowRef';
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from 'angular-2-local-storage';

import * as io from 'socket.io-client';
import {Observable} from "rxjs/Observable";

declare var require: any;
let Web3 = require('web3');
let ForcedMatrix = require('./../../../../../build/contracts/ForcedMatrix.json');

@Injectable()
export class Web3Service {

  public isMetamaskConnected: boolean;
  public isMetamaskUnlocked: boolean;
  private forcedMatrix: any;
  private forcedMatrixAddress;

  private web3: any;
  private window: any;

  public coinbase: string;
  private socket;


  constructor(private httpClient: HttpClient,
              private winRef: WindowRef,
              private localStorageService: LocalStorageService) {

    this.isMetamaskConnected = false;
    this.isMetamaskUnlocked = false;
    this.forcedMatrixAddress = '';
    this.window = this.winRef.nativeWindow;

    this.bootstrapWeb3();

    this.socket = io('', {
      path: '/socket.io',
      transports: ['websocket'],
      secure: true,
    });
    this.socket.on('connect', () => {
      console.log('Ws connected');
    });
    this.socket.on('disconnect', () => {
      console.log('disconnected');
    });
  }

  public getCoinbase() {
    return this.web3.eth.getCoinbase();
  };

  public async bootstrapWeb3() {

    if (typeof this.window.web3 !== "undefined") {
      this.web3 = new Web3(this.window.web3.currentProvider);

      this.httpClient.get('/api/provider-settings')
        .subscribe(response => {
          this.forcedMatrixAddress = response['data'].matrix_address;
          this.forcedMatrix = new this.web3.eth.Contract(ForcedMatrix.abi, this.forcedMatrixAddress);
        });

      this.web3.eth.getCoinbase().then(address => this.coinbase = address);
      this.isMetamaskConnected = true;

      const accounts = await this.web3.eth.getAccounts();
      this.isMetamaskUnlocked = accounts.length > 0;
    }
  }

  public async signMessage(message) {

    return new Promise((resolve, reject) => {
      this.web3.currentProvider.sendAsync({
        method: 'eth_signTypedData',
        params: [message, this.coinbase],
        from: this.coinbase
      }, function (err, result) {
        result.error ? reject(result.error): resolve(result);
      });
    });
  }

  public sendEthMatrixBank(cb) {
    const sendAmount = this.web3.utils.toWei('0.1', 'ether');

    return this.web3.eth.sendTransaction({
      from: this.coinbase,
      to: this.forcedMatrixAddress,
      value: sendAmount,
      gasPrice: '0x2540BE400'
    }, cb);
  }

  public isEthAddress(address) {
    if (!this.web3) {
      return false;
    }
    return this.web3.utils.isAddress(address);
  }

  public onBuySubmit(parent: string, onSendCb?, onSuccessCb?, onMiddleCb?) {
    let localStorageParent: any = this.localStorageService.get('hasSpot');
    let pair = null;

    if(localStorageParent) {
      pair = localStorageParent.find(item => item.coinbase === this.coinbase);

      if(!pair) {
        pair = {
          coinbase: this.coinbase,
          parent: parent
        };

        localStorageParent.push(pair);
      }
    }

    else {
      pair = {
        coinbase: this.coinbase,
        parent: parent
      };
      localStorageParent = [pair];
    }

    if(pair.parent !== pair.coinbase) {
      pair.parent = this.coinbase;
    }

    console.log('PAID', pair);

    const signMessageData = [
      {
        type: 'string',
        name: 'Parent',
        value: parent,
      },
      {
        type: 'string',
        name: 'Address',
        value: pair.coinbase
      }
    ];

    this.sendEthMatrixBank((err, txHash) => {

      onMiddleCb && onMiddleCb();

      if (txHash) {
        signMessageData.push({
          type: 'string',
          name: 'Transaction',
          value: txHash.toString()
        });
      }
    })
    .then(() => {
      console.log('Signed message data', signMessageData);
      onMiddleCb && onMiddleCb();
      return this.signMessage(signMessageData);
    })
    .then(resultObj => {
      console.log('Message signed', resultObj);
      return this.sendBuySpotRequest(signMessageData, resultObj['result']);
    })
    .then(() => {
      this.localStorageService.set('hasSpot', localStorageParent);
      onSuccessCb && onSuccessCb();
    })
    .catch((err) => console.log('Buying spot transaction rejected', err));
  }

  public sendBuySpotRequest(messageData, signature) {

    return this.httpClient.post('/api/buy-spot', {
      data: messageData,
      signature: signature
    }).toPromise();
  }

  public existsInMatrix(address) {
    return this.httpClient.post(`/api/${address}/exists`, {})
      .toPromise();
  }

  public dataRefresh() {
    return new Observable(observer => {
      this.socket.on('refresh', (data) => {
        console.log(data);
        return observer.next(data);
      })
    });
  }
}
