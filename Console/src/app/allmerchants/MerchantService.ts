import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginService } from '../login/LoginService';

@Injectable({
  providedIn: 'root',
})
export class MerchantService {
  constructor(private loginService: LoginService) {}

  allMerchants = [];
  allMerchantsTemp: Array<any> = [];
  merchants = [];
  pageIndex = 0;
  selectedMerchant = JSON.parse(localStorage.getItem('selectedMerchant'));

  colors = [
    '#8bc34a',
    '#f9a825',
    '#00b0ff',
    '#ff1744',
    '#512da8',
    '#00acc1',
    '#1a237e',
    '#5d4037',
    '#880e4f',
  ];

  async getMerchants() {
    var response;
    try {
      response = await axios.get(this.loginService.url + 'getMerchants', {
        headers: { token: this.loginService.token },
      });
      this.allMerchants = response.data;
      this.allMerchantsTemp = response.data;
    } catch (e) {
      response = { data: { err: e } };
      this.allMerchants = [];
    }
    console.log(response);
  }

  filterWithName(query: String) {
    this.pageIndex = 0;
    this.allMerchants = [];
    for (var i = 0; i < this.allMerchantsTemp.length; i++) {
      if (
        this.allMerchantsTemp[i].name
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        console.log(this.allMerchantsTemp[i]);
        this.allMerchants.push(this.allMerchantsTemp[i]);
      }
    }
  }

  filterWithNumber(query: String) {
    this.pageIndex = 0;
    this.allMerchants = [];
    for (var i = 0; i < this.allMerchantsTemp.length; i++) {
      if (
        this.allMerchantsTemp[i].number
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        this.allMerchants.push(this.allMerchantsTemp[i]);
      }
    }
  }

  filterWithEmail(query: String) {
    this.pageIndex = 0;
    this.allMerchants = [];
    for (var i = 0; i < this.allMerchantsTemp.length; i++) {
      if (
        this.allMerchantsTemp[i].email
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        this.allMerchants.push(this.allMerchantsTemp[i]);
      }
    }
  }

  filterWithStoreName(query: String) {
    this.pageIndex = 0;
    this.allMerchants = [];
    for (var i = 0; i < this.allMerchantsTemp.length; i++) {
      if (
        this.allMerchantsTemp[i].storeName
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        this.allMerchants.push(this.allMerchantsTemp[i]);
      }
    }
  }

  convertToURL(id: String): String {
    return `https://rec-wallet-profile-pictures.s3.us-east-2.amazonaws.com/${id}.jpg`;
  }

  getNext(isMove = false): Array<any> {
    if (isMove) this.pageIndex += 1;
    this.merchants = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allMerchants.length;
      i++
    ) {
      this.merchants.push({ ...this.allMerchants[i], index: i + 1 });
      console.log(this.allMerchants[i]);
    }
    return this.merchants;
  }

  getPrev(): Array<any> {
    this.pageIndex -= 1;
    this.merchants = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allMerchants.length;
      i++
    ) {
      this.merchants.push({ ...this.allMerchants[i], index: i + 1 });
    }
    return this.merchants;
  }

  async updateStatus(status: String, id: String): Promise<boolean> {
    var response;
    try {
      response = await axios.post(
        this.loginService.url + 'updateMerchantStatus',
        {
          id: id,
          status,
        },
        {
          headers: { token: this.loginService.token },
        }
      );
      console.log(response);
      if (response.message == 'done') {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
