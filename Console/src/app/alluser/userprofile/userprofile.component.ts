import { Component, OnInit } from '@angular/core';
import { UserService } from '../UserService';
import { Router } from '@angular/router';
import { UserTransactionsService } from './UserTransactionsService';
import QRCode from 'qrcode';
@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss'],
})
export class UserprofileComponent implements OnInit {
  constructor(
    public userService: UserService,
    public userTransactionsService: UserTransactionsService,
    private router: Router
  ) {}

  isLoading = true;
  isSelectedTransactionLoading = false;
  transactions = [];
  pageStatus = 'Showing 0 to 0 of 0';
  colors = this.userService.colors;
  colorMap: Map<String, String> = new Map();
  selectedTransaction = 0;

  async ngOnInit() {
    console.log(this.userService.selectedUser);
    this.generateQrCode();
    if (!this.userService.selectedUser) {
      this.router.navigate(['/Home/AllUsers/ListUsers'], {
        replaceUrl: true,
      });
    }
    await this.userTransactionsService.getTransactions();
    this.transactions = this.userTransactionsService.getNext();
    console.log(this.transactions);
    this.isLoading = false;
  }

  getColor(number: string, index: number): String {
    if (this.colorMap[number]) {
      return this.colorMap[number];
    } else {
      this.colorMap[number] = this.colors[index % this.colors.length];
      return this.colorMap[number];
    }
  }

  selectTransaction(index: number) {
    this.selectedTransaction = index;
    this.isSelectedTransactionLoading = true;
    setTimeout(() => {
      this.isSelectedTransactionLoading = false;
    }, 600);
  }

  generateQrCode() {
    var canvas = document.getElementById('qrcode');
    QRCode.toCanvas(
      canvas,
      this.userService.selectedUser.qrcode || '',
      function (error) {
        if (error) console.error(error);
        console.log('success!');
      }
    );
  }
}
