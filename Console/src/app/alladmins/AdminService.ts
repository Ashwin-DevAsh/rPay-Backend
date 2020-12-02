import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginService } from '../login/LoginService';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private loginService: LoginService) {}

  allAdmins = [];
  allAdminsTemp: Array<any> = [];
  admins = [];
  pageIndex = 0;

  async getAdmins() {
    var response;
    try {
      response = await axios.get(this.loginService.url + 'getAdmins', {
        headers: { token: this.loginService.token },
      });
      this.allAdmins = response.data;
      this.allAdminsTemp = response.data;
    } catch (e) {
      response = { data: { err: e } };
      this.allAdmins = [];
    }
    console.log(response);
  }

  filterWithName(query: String) {
    this.pageIndex = 0;
    this.allAdmins = [];
    for (var i = 0; i < this.allAdminsTemp.length; i++) {
      if (
        this.allAdminsTemp[i].name.toLowerCase().includes(query.toLowerCase())
      ) {
        console.log(this.allAdminsTemp[i]);
        this.allAdmins.push(this.allAdminsTemp[i]);
      }
    }
  }

  filterWithNumber(query: String) {
    this.pageIndex = 0;
    this.allAdmins = [];
    for (var i = 0; i < this.allAdminsTemp.length; i++) {
      if (
        this.allAdminsTemp[i].number.toLowerCase().includes(query.toLowerCase())
      ) {
        this.allAdmins.push(this.allAdminsTemp[i]);
      }
    }
  }

  filterWithEmail(query: String) {
    this.pageIndex = 0;
    this.allAdmins = [];
    for (var i = 0; i < this.allAdminsTemp.length; i++) {
      if (
        this.allAdminsTemp[i].email.toLowerCase().includes(query.toLowerCase())
      ) {
        this.allAdmins.push(this.allAdminsTemp[i]);
      }
    }
  }

  filterWithStoreName(query: String) {
    this.pageIndex = 0;
    this.allAdmins = [];
    for (var i = 0; i < this.allAdminsTemp.length; i++) {
      if (
        this.allAdminsTemp[i].storeName
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        this.allAdmins.push(this.allAdminsTemp[i]);
      }
    }
  }

  getNext(isMove = false): Array<any> {
    if (isMove) this.pageIndex += 1;
    this.admins = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allAdmins.length;
      i++
    ) {
      this.admins.push({ ...this.allAdmins[i], index: i + 1 });
    }
    return this.admins;
  }

  getPrev(): Array<any> {
    this.pageIndex -= 1;
    this.admins = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allAdmins.length;
      i++
    ) {
      this.admins.push({ ...this.allAdmins[i], index: i + 1 });
    }
    return this.admins;
  }

  async updateStatus(status: String, id: String): Promise<boolean> {
    var response;
    try {
      response = await axios.post(
        this.loginService.url + 'updateAdminstatus',
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
