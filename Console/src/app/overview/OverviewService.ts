import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginService } from '../login/LoginService';
import { transition } from '@angular/animations';
import { summaryFileName } from '@angular/compiler/src/aot/util';
import { StaticSymbol } from '@angular/compiler';

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  constructor(private loginService: LoginService) {}

  graphTimeLine: String = 'Today';
  graphTimeLines: Array<String> = [
    'Past 7 Days',
    'Past 30 Days',
    'Past 90 Days',
    'Past 1 Year',
    'All Time',
  ];

  graphMode = 0;
  intervalMode = 3;
  days = 1;

  transactionsVolume = new Stats();
  noTransactions = new Stats();
  generated = new Stats();
  withdraw = new Stats();

  mainList = [
    this.transactionsVolume,
    this.generated,
    this.noTransactions,
    this.withdraw,
  ];

  loadMainList() {
    this.mainList = [
      this.transactionsVolume,
      this.generated,
      this.noTransactions,
      this.withdraw,
    ];
  }

  async getTransactionStats() {
    var response;
    try {
      response = await axios.get(
        this.loginService.url + `getTransactionStats/${this.getDays()}`,
        {
          headers: { token: this.loginService.token },
        }
      );
      console.log(response);
      var day: Array<any> = response.data.day.rows;
      var hour: Array<any> = response.data.hour.rows;
      var week: Array<any> = response.data.week.rows;
      var month: Array<any> = response.data.month.rows;

      console.log(day);
      this.transactionsVolume.response = response.data;
      this.addToList(this.transactionsVolume, [day, week, month, hour]);
      console.log(this.transactionsVolume.daily);
    } catch (e) {
      response = { data: { err: e } };
    }
    console.log(response);
  }

  async getWithdrawStats() {
    var response;
    try {
      response = await axios.get(
        this.loginService.url + `getWithdrawStats/${this.getDays()}`,
        {
          headers: { token: this.loginService.token },
        }
      );
      console.log(response);
      var day: Array<any> = response.data.day.rows;
      var hour: Array<any> = response.data.hour.rows;
      var week: Array<any> = response.data.week.rows;
      var month: Array<any> = response.data.month.rows;

      console.log(day);
      this.withdraw.response = response.data;
      this.addToList(this.withdraw, [day, week, month, hour]);
    } catch (e) {
      response = { data: { err: e } };
    }
    console.log(response);
  }

  async getNoTransactionStats() {
    var response;
    try {
      response = await axios.get(
        this.loginService.url + `getNoTransactionStats/${this.getDays()}`,
        {
          headers: { token: this.loginService.token },
        }
      );
      var day: Array<any> = response.data.day.rows;
      var week: Array<any> = response.data.week.rows;
      var month: Array<any> = response.data.month.rows;
      var hour: Array<any> = response.data.hour.rows;
      this.addToList(this.noTransactions, [day, week, month, hour]);
      this.noTransactions.response = response.data;
    } catch (e) {
      response = { data: { err: e } };
    }
  }

  async getGeneratedStats() {
    var response;
    try {
      response = await axios.get(
        this.loginService.url + `getGeneratedStats/${this.getDays()}`,
        {
          headers: { token: this.loginService.token },
        }
      );
      var day: Array<any> = response.data.day.rows;
      var week: Array<any> = response.data.week.rows;
      var month: Array<any> = response.data.month.rows;
      var hour: Array<any> = response.data.hour.rows;
      this.addToList(this.generated, [day, week, month, hour]);
      this.generated.response = response.data;
    } catch (e) {
      response = { data: { err: e } };
    }
  }

  addToList(stats: Stats, intervalList: Array<any>) {
    var interval = ['daily', 'weekly', 'monthly', 'hourly'];
    for (var j = 0; j < interval.length; j++) {
      for (var i = 0; i < intervalList[j].length; i++) {
        stats[interval[j]].x.push(intervalList[j][i].total);
        stats[interval[j]].fromDate.push(
          j == 3
            ? intervalList[j][i]['fromdate'].split('T')[1].substring(0, 5)
            : new Date(intervalList[j][i]['fromdate']).toDateString()
        );
        stats[interval[j]].toDate.push(
          j == 3
            ? intervalList[j][i]['fromdate'].split('T')[1].substring(0, 5)
            : new Date(intervalList[j][i]['todate']).toDateString()
        );
        stats[interval[j]].csvData.push({
          fromDate:
            j == 3
              ? intervalList[j][i]['fromdate'].split('T')[1].substring(0, 5)
              : new Date(intervalList[j][i]['fromdate']).toDateString(),
          toDate:
            j == 3
              ? intervalList[j][i]['fromdate'].split('T')[1].substring(0, 5)
              : new Date(intervalList[j][i]['todate']).toDateString(),
          amount: intervalList[j][i].total,
        });
        stats[interval[j]].total += Number.parseFloat(intervalList[j][i].total);
      }
    }
  }

  getDays(): number {
    switch (this.graphTimeLine) {
      case 'Today':
        return 1;
      case 'Past 7 Days':
        return 7;
      case 'Past 30 Days':
        return 30;
      case 'Past 90 Days':
        return 90;
      case 'Past 1 Year':
        return 365;
      case 'All Time':
        return 0;
    }
  }

  clear() {
    this.transactionsVolume = new Stats();
    this.noTransactions = new Stats();
    this.generated = new Stats();
    this.withdraw = new Stats();
  }
}

class Stats {
  daily = {
    x: [],
    fromDate: [],
    toDate: [],
    total: 0,
    csvData: [],
  };
  weekly = {
    x: [],
    fromDate: [],
    toDate: [],
    total: 0,
    csvData: [],
  };
  monthly = {
    x: [],
    fromDate: [],
    toDate: [],
    total: 0,
    csvData: [],
  };
  hourly = {
    x: [],
    fromDate: [],
    toDate: [],
    total: 0,
    csvData: [],
  };
  response: null;
}
