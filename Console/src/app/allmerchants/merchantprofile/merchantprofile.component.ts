import { Component, OnInit } from '@angular/core';
import { MerchantService } from '../MerchantService';
import { Router } from '@angular/router';
import { MerchantTransactionService } from './MerchantTransactionsService';
import { UserService } from 'src/app/alluser/UserService';
import QRCode from 'qrcode';

@Component({
  selector: 'app-merchantprofile',
  templateUrl: './merchantprofile.component.html',
  styleUrls: ['./merchantprofile.component.scss'],
})
export class MerchantprofileComponent implements OnInit {
  constructor(
    public merchantService: MerchantService,
    public merchantTransactionsService: MerchantTransactionService,
    private router: Router,
    private userService: UserService
  ) {}

  isLoading = true;
  isSelectedTransactionLoading = false;
  transactions = [];
  pageStatus = 'Showing 0 to 0 of 0';
  colors = this.userService.colors;
  colorMap: Map<String, String> = new Map();
  selectedTransaction = 0;

  async ngOnInit() {
    console.log(this.merchantService.selectedMerchant);
    this.generateQrCode();
    if (!this.merchantService.selectedMerchant) {
      this.router.navigate(['/Home/AllUsers/ListUsers'], {
        replaceUrl: true,
      });
    }
    await this.merchantTransactionsService.getTransactions();
    this.transactions = this.merchantTransactionsService.getNext();
    console.log(this.transactions);
    this.isLoading = false;
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
    QRCode.toCanvas(canvas, this.userService.selectedUser.qrcode, function (
      error
    ) {
      if (error) console.error(error);
      console.log('success!');
    });
  }

  getColor(number: string, index: number): String {
    if (this.colorMap[number]) {
      return this.colorMap[number];
    } else {
      this.colorMap[number] = this.colors[index % this.colors.length];
      return this.colorMap[number];
    }
  }
}
