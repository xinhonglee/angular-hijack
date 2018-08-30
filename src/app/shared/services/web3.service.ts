import { Injectable } from '@angular/core';
import { WindowRef } from '../utils/WindowRef';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';

import * as io from 'socket.io-client';

declare var require: any;
let Web3 = require('web3');

@Injectable()
export class Web3Service {

    public isMetamaskConnected: boolean;
    public isMetamaskUnlocked: boolean;
    private forcedMatrixAddress;

    private web3: any;
    private window: any;

    public coinbase: string;
    private socket;

    public onWeb3Bootstraped;

    public onWeb3AccountChange;

    private txHash;
    private signMessageData;
    private checkTxData;
    private middleCallback;
    private successCallback;
    private localStorageParent;

    private checkTxSubscription;

    constructor(private httpClient: HttpClient,
                private winRef: WindowRef,
                private localStorageService: LocalStorageService) {

        this.isMetamaskConnected = false;
        this.isMetamaskUnlocked = false;
        this.forcedMatrixAddress = '';
        this.window = this.winRef.nativeWindow;

        this.onWeb3Bootstraped = this.bootstrapWeb3();

        this.onWeb3AccountChange = Observable.interval(1000).flatMap(async () => {
            if (!this.web3) return false;

            const accounts = await this.web3.eth.getAccounts();

            if (this.coinbase && this.coinbase.toLowerCase() !== accounts[0].toLowerCase()) {
                // console.log(`Account changed from ${this.coinbase} to ${accounts[0]}`);
                // this.coinbase = accounts[0];

                return false;
            }

            return false;
        });


        // this.checkTxData = Observable.interval(1000).flatMap(async () => {
        //   await this.checkTransaction();
        // });

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

        if (typeof this.window.web3 !== 'undefined') {
            this.web3 = new Web3(this.window.web3.currentProvider);

            this.httpClient.get('/api/provider-settings').subscribe(response => {
                this.forcedMatrixAddress = response['data'].matrix_address;
            });

            // this.coinbase = await this.web3.eth.getCoinbase();
            this.isMetamaskConnected = true;

            const accounts = await this.web3.eth.getAccounts();
            this.coinbase = accounts[0];
            this.isMetamaskUnlocked = accounts.length > 0;

        } else {
            this.isMetamaskConnected = false;
        }
    }

    public sendEthMatrixBank(cb) {
        const pendingTx: any = this.localStorageService.get('pendingTx');
        if (pendingTx) return Promise.resolve(cb(null, pendingTx));

        // const sendAmount = this.web3.utils.toWei('0.001', 'ether');
        const sendAmount = this.web3.utils.toWei('0.1', 'ether');

        return this.web3.eth.sendTransaction({
            from: this.coinbase,
            to: this.forcedMatrixAddress,
            value: sendAmount,
            gasPrice: '0x174876E800' // 100 gwei
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

        if (localStorageParent) {
            pair = localStorageParent.find(item => item.coinbase === this.coinbase);

            if (!pair) {
                pair = {
                    coinbase: this.coinbase,
                    parent: parent
                };

                localStorageParent.push(pair);
            }
        } else {
            pair = {
                coinbase: this.coinbase,
                parent: parent
            };
            localStorageParent = [pair];
        }

        if (pair.parent !== pair.coinbase) {
            pair.parent = this.coinbase;
        }

        this.signMessageData = [
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

        return this.sendEthMatrixBank((err, tx) => {
            if (!err) {
                this.txHash = tx;
                onMiddleCb && onMiddleCb();
                this.middleCallback = onMiddleCb;
                this.successCallback = onSuccessCb;
                this.localStorageParent = localStorageParent;

                this.localStorageService.set('pendingTx', tx);

                // this.checkTxSubscription = this.checkTxData.subscribe();
                this.checkTxSubscription = setInterval(async () => {
                    await this.checkTransaction();
                    console.log('Checking for TX receipt...');
                }, 1000);
            }
        });
    }

    private checkTransaction() {
        this.web3.eth.getTransactionReceipt(this.txHash, (err, tx) => {
            if (!err && tx) {
                // this.checkTxSubscription.unsubscribe();
                console.log('TX receipt found, move on..');
                clearInterval(this.checkTxSubscription);
                this.finishSpotPurchase();
            }
        });
    }

    public async finishSpotPurchase() {
        this.middleCallback && this.middleCallback();

        let tx = null;

        while (!tx) {
            tx = await this.web3.eth.getTransaction(this.txHash);
        }

        console.log(tx);

        const addData = [
            {
                type: 'string',
                name: 'Transaction',
                value: tx.hash
            },
            {
                type: 'string',
                name: 'From',
                value: tx.from
            },
            {
                type: 'string',
                name: 'Amount',
                value: tx.value
            },
            {
                type: 'string',
                name: 'Block',
                value: tx.blockNumber.toString()
            }
        ];
        const signMessageData = [...this.signMessageData, ...addData];

        await this.sendBuySpotRequest(signMessageData);

        this.localStorageService.set('hasSpot', this.localStorageParent);
        this.localStorageService.set('pendingTx', null);
        this.successCallback && this.successCallback();
    }

    public sendBuySpotRequest(messageData) {

        return this.httpClient.post('/api/buy-spot', {
            data: messageData
        }).toPromise();
    }

    public existsInMatrix(address) {
        return this.httpClient.post(`/api/${address}/exists`, {}).toPromise();
    }

    public dataRefresh() {
        return new Observable(observer => {
            this.socket.on('refresh', (data) => {
                console.log(data);
                return observer.next(data);
            });
        });
    }
}
