import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginService } from '../login/LoginService';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private loginService: LoginService) {}

  allUsers = [];
  allUsersTemp: Array<any> = [];
  users = [];
  pageIndex = 0;
  selectedUser = JSON.parse(localStorage.getItem('selectedUser'));

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

  async getUsers() {
    var response;
    try {
      response = await axios.get(this.loginService.url + 'getUsers', {
        headers: { token: this.loginService.token },
      });

      this.allUsers = response.data;
      this.allUsersTemp = response.data;
      console.log(this.allUsers);
    } catch (e) {
      response = { data: { err: e } };
      this.allUsers = [];
    }
    console.log(response);
  }

  filterWithName(query: String) {
    this.pageIndex = 0;
    this.allUsers = [];
    for (var i = 0; i < this.allUsersTemp.length; i++) {
      if (
        this.allUsersTemp[i].name.toLowerCase().includes(query.toLowerCase())
      ) {
        this.allUsers.push(this.allUsersTemp[i]);
      }
    }
  }

  filterWithNumber(query: String) {
    this.pageIndex = 0;
    this.allUsers = [];
    for (var i = 0; i < this.allUsersTemp.length; i++) {
      if (
        this.allUsersTemp[i].number.toLowerCase().includes(query.toLowerCase())
      ) {
        this.allUsers.push(this.allUsersTemp[i]);
      }
    }
  }

  filterWithEmail(query: String) {
    this.pageIndex = 0;
    this.allUsers = [];
    for (var i = 0; i < this.allUsersTemp.length; i++) {
      if (
        this.allUsersTemp[i].email.toLowerCase().includes(query.toLowerCase())
      ) {
        this.allUsers.push(this.allUsersTemp[i]);
      }
    }
  }

  convertToURL(id: String): String {
    return `https://rec-wallet-profile-pictures.s3.us-east-2.amazonaws.com/${id}.jpg`;
  }

  getNext(isMove = false): Array<any> {
    if (isMove) this.pageIndex += 1;
    this.users = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allUsers.length;
      i++
    ) {
      this.users.push({ ...this.allUsers[i], index: i + 1 });
    }
    return this.users;
  }

  getPrev(): Array<any> {
    this.pageIndex -= 1;
    this.users = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allUsers.length;
      i++
    ) {
      this.users.push({ ...this.allUsers[i], index: i + 1 });
    }
    return this.users;
  }
}
