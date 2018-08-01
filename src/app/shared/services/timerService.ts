import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import { UUID } from 'angular2-uuid';

interface TimerList {
  [name: string]: {
    second: number,
    observable: Observable<any>
  };
}

interface SubscriptionList {
  [id: string]: {
    name: string,
    subscription: Subscription
  };
}

@Injectable()
export class TimerService {

  private timer: TimerList;
  private subscription: SubscriptionList;


  constructor() {
    this.timer = {};
    this.subscription = {};
  }

  getTimer(): string[] {
    return Object.keys(this.timer);
  }

  getSubscription(): string[] {
    return Object.keys(this.subscription);
  }

  createTimer(name: string, seconds:number=1) {
    if (name === undefined || seconds === undefined || this.timer[name]) {
      return false;
    }
    const o = Observable.timer(0, seconds * 1000);
    this.timer[name] = { second: seconds, observable: o };
    return true;
  }

  destroyTimer(name: string): boolean {
    if (name === undefined || !this.timer[name]) {
      return false;
    }

    let s = this.getSubscription();

    s.forEach(i => {
      if (this.subscription[i].name === name) {
        this.unsubscribe(i);
      }
    });

    delete this.timer[name].observable;
    delete this.timer[name];
  }


  subscribe(name: string, callback: () => void): string {
    if (!this.timer[name]) {
      return '';
    }
    let id = name + '-' + UUID.UUID();
    this.subscription[id] = {
      name: name,
      subscription: this.timer[name].observable.subscribe(callback)
    };
    return id;
  }

  unsubscribe(id: string): boolean {
    if (!id || !this.subscription[id]) {
      return false;
    }
    this.subscription[id].subscription.unsubscribe();
    delete this.subscription[id];

    return true;
  }


  public formatSeconds = function(totalSeconds): string | number {
    let minutes = Math.floor((totalSeconds) / 60);
    let seconds = totalSeconds - (minutes * 60);

    seconds = Math.round(seconds * 100) / 100;

    let result = (minutes < 10 ? "0" + minutes : minutes);
    result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result;
  }

}
