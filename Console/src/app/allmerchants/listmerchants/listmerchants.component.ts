import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/alluser/UserService';
import { MerchantService } from '../MerchantService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listmerchants',
  templateUrl: './listmerchants.component.html',
  styleUrls: ['./listmerchants.component.scss'],
})
export class ListmerchantsComponent implements OnInit {
  constructor(
    public userService: UserService,
    public merchantService: MerchantService,
    public router: Router
  ) {}

  isLoading = true;
  merchants = [];
  colors = this.userService.colors;
  pageStatus = 'Showing 0 to 0 of 0';

  searchMode = 'Name';

  searchModes = ['Number', 'Email', 'Name', 'Store Name'];

  async ngOnInit() {
    this.isLoading = true;
    await this.merchantService.getMerchants();
    this.merchants = this.merchantService.getNext(false);
    this.pageStatus = `Showing ${this.merchants[0].index} to ${
      this.merchants[this.merchants.length - 1].index
    } of ${this.merchantService.allMerchants.length}`;
    this.isLoading = false;
  }

  filter(query: String) {
    this.isLoading = true;
    switch (this.searchMode) {
      case 'Number': {
        this.merchantService.filterWithNumber(query);
        break;
      }

      case 'Name': {
        this.merchantService.filterWithName(query);
        break;
      }

      case 'Email': {
        this.merchantService.filterWithEmail(query);
        break;
      }

      case 'Store Name': {
        this.merchantService.filterWithStoreName(query);
        break;
      }
    }
    this.merchants = this.merchantService.getNext();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  nav(next = true) {
    if (next) {
      this.merchants = this.merchantService.getNext(true);
    } else {
      this.merchants = this.merchantService.getPrev();
    }
    this.pageStatus = `Showing ${this.merchants[0].index} to ${
      this.merchants[this.merchants.length - 1].index
    } of ${this.merchantService.allMerchants.length}`;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  async openMerchantProfile(item: Object) {
    this.merchantService.selectedMerchant = item;
    localStorage.setItem('selectedMerchant', JSON.stringify(item));
    this.router.navigate(['/Home/AllMerchants/MerchantProfile']);
  }

  updateStatus(status: String, item: any) {
    console.log(status);
    this.merchantService.updateStatus(status, item.id).then((isUpdated) => {
      if (isUpdated) {
        item.status = status;
      }
    });
  }
}
