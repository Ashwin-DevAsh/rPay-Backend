import { Component, OnInit } from '@angular/core';
import { TransactionsService } from './TransactionsService';
import { ExportToCsv } from 'export-to-csv';
import { Router } from '@angular/router';
import { UserService } from '../alluser/UserService';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  pageStatus = 'Showing 0 to 0 of 0';
  searchMode = 'Transaction ID';

  searchModes = ['Transaction ID', 'Number', 'Email', 'Name'];

  constructor(
    public transactionService: TransactionsService,
    private userService: UserService,
    private router: Router
  ) {}

  transactions = [];
  isLoading = true;

  paymentId = [];

  async ngOnInit() {
    await this.transactionService.getTransactions();
    this.transactions = this.transactionService.getNext();
    console.log(this.transactions[0].tometadata);

    this.loadStatus();

    this.isLoading = false;
  }

  nav(next = true) {
    this.isLoading = true;
    if (next) {
      this.transactions = this.transactionService.getNext(true);
    } else {
      this.transactions = this.transactionService.getPrev();
    }
    this.loadStatus();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  loadStatus() {
    this.pageStatus = `Showing ${this.transactions[0].index} to ${
      this.transactions[this.transactions.length - 1].index
    } of ${this.transactionService.allTransactions.length}`;
  }

  filter(query: string) {
    console.log(query);
    switch (this.searchMode) {
      case 'Transaction ID': {
        this.transactionService.filterWithID(query);
        break;
      }

      case 'Number': {
        this.transactionService.filterWithNumber(query);
        break;
      }

      case 'Name': {
        this.transactionService.filterWithName(query);
        break;
      }

      case 'Email': {
        this.transactionService.filterWithEmail(query);
        break;
      }
    }
    this.transactions = this.transactionService.getNext();
    this.pageStatus = `Showing ${this.transactionService.allTransactions.length} of ${this.transactionService.allTransactions.length}`;
  }

  download() {
    this.isLoading = true;
    var csvData = [];
    for (
      var i = this.transactionService.allTransactions.length - 1;
      i >= 0;
      i--
    ) {
      csvData.push({
        id: this.transactionService.allTransactions[i].transactionid,
        time: this.transactionService.allTransactions[i].transactiontime,
        amount: this.transactionService.allTransactions[i].amount,

        fromName: this.transactionService.allTransactions[i].frommetadata.Name,
        fromNumber: this.transactionService.allTransactions[i].frommetadata
          .Number,
        fromEmail: this.transactionService.allTransactions[i].frommetadata
          .Email,
        fromID: this.transactionService.allTransactions[i].frommetadata.Id,

        toName: this.transactionService.allTransactions[i].tometadata.Name,
        toNumber: this.transactionService.allTransactions[i].tometadata.Number,
        toEmail: this.transactionService.allTransactions[i].tometadata.Email,
        toID: this.transactionService.allTransactions[i].tometadata.Id,

        type: this.transactionService.allTransactions[i].isgenerated
          ? 'Generated'
          : this.transactionService.allTransactions[i].iswithdraw
          ? 'Withdraw'
          : 'Transaction',
      });
    }
    const options = {
      title: 'rpay-transactions',
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(csvData);
    this.isLoading = false;
  }
}
