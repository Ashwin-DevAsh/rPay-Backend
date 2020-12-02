import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginService } from '../../login/LoginService';
import { UserService } from '../UserService';
import { transition } from '@angular/animations';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class UserTransactionsService {
  constructor(
    private loginService: LoginService,
    private userService: UserService
  ) {}
  transactions: Array<any>;
  page: number = 0;
  allTransactions: Array<any>;
  transactionsPerpage = 20;
  balance = '0';

  async getTransactions() {
    var response;
    try {
      response = await axios.get(
        this.loginService.url +
          'getMyTransactions/' +
          this.userService.selectedUser.id,
        {
          headers: { token: this.loginService.token },
        }
      );
      this.allTransactions = response.data.rows;
      this.transactionsPerpage = this.allTransactions.length;
      this.balance = this.numberWithCommas(response.data.balance);
      console.log(this.allTransactions);
    } catch (e) {
      response = { data: { err: e } };
      this.allTransactions = [];
    }
    console.log(response);
  }

  numberWithCommas(x: string) {
    try {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } catch {
      return x;
    }
  }

  getNext(isMove = false): Array<any> {
    this.transactions = [];
    for (var i = this.allTransactions.length - 1; i >= 0; i--) {
      this.transactions.push({
        index: i + 1,
        name:
          this.userService.selectedUser.id ==
          this.allTransactions[i].frommetadata.Id
            ? this.allTransactions[i].tometadata.Name
            : this.allTransactions[i].frommetadata.Name,
        amount:
          this.userService.selectedUser.id ==
          this.allTransactions[i].frommetadata.Id
            ? '-' + this.allTransactions[i].amount + '.00'
            : '+' + this.allTransactions[i].amount + '.00',
        number:
          this.userService.selectedUser.id ==
          this.allTransactions[i].frommetadata.Id
            ? this.allTransactions[i].tometadata.Id
            : this.allTransactions[i].frommetadata.Id,
        transactiontime: this.allTransactions[i].transactiontime,
        isSend:
          this.userService.selectedUser.id ==
          this.allTransactions[i].frommetadata.Id,
        isGenerated: this.allTransactions[i].isgenerated,
        isWithdraw: this.allTransactions[i].iswithdraw,
        transactionid: this.allTransactions[i].transactionid,
      });
    }

    console.log(this.transactions);
    return this.transactions;
  }
}
