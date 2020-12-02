import { Component, OnInit } from '@angular/core';
import { AdminService } from '../AdminService';
import axios from 'axios';
import { LoginService } from '../../login/LoginService';

@Component({
  selector: 'app-listadmins',
  templateUrl: './listadmins.component.html',
  styleUrls: ['./listadmins.component.scss'],
})
export class ListadminsComponent implements OnInit {
  constructor(
    public adminService: AdminService,
    private loginService: LoginService
  ) {}

  addAdmin = false;
  isLoading = true;
  admins = [];
  pageStatus = 'Showing 0 to 0 of 0';
  searchMode = 'Name';
  searchModes = ['Number', 'Email', 'Name'];

  password = '';
  invalidEmail = false;
  invalidPassword = false;
  invalidName = false;
  email = '';
  name = '';
  number = '';
  invalidNumber = false;

  showError = false;
  showMessage = false;
  message = '';

  async ngOnInit() {
    this.load();
  }

  async load() {
    this.isLoading = true;
    await this.adminService.getAdmins();
    this.admins = this.adminService.getNext(false);
    this.pageStatus = `Showing ${this.admins[0].index} to ${
      this.admins[this.admins.length - 1].index
    } of ${this.adminService.allAdmins.length}`;
    this.isLoading = false;
  }

  filter(query: String) {
    this.isLoading = true;
    switch (this.searchMode) {
      case 'Number': {
        this.adminService.filterWithNumber(query);
        break;
      }

      case 'Name': {
        this.adminService.filterWithName(query);
        break;
      }

      case 'Email': {
        this.adminService.filterWithEmail(query);
        break;
      }

      case 'Store Name': {
        this.adminService.filterWithStoreName(query);
        break;
      }
    }
    this.admins = this.adminService.getNext();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  nav(next = true) {
    if (next) {
      this.admins = this.adminService.getNext(true);
    } else {
      this.admins = this.adminService.getPrev();
    }
    this.pageStatus = `Showing ${this.admins[0].index} to ${
      this.admins[this.admins.length - 1].index
    } of ${this.adminService.allAdmins.length}`;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  createAccount() {
    if (this.validate()) {
      this.addAdmin = false;
      this.isLoading = true;
      setTimeout(() => {
        axios
          .post(`${this.loginService.url}addAdmin`, {
            email: this.email,
            name: this.name,
            number: this.number,
            password: this.password,
          })
          .then((res) => {
            console.log(res);
            if (res.data.message === 'done') {
              this.load().then(() => {
                this.isLoading = false;
                this.message = 'Successfully Created';
                this.addAdmin = true;
                this.showMessage = true;
              });
            } else if (res.data.message === 'Admin already exist') {
              this.isLoading = false;
              this.addAdmin = true;
              this.showError = true;
              this.message = 'Email or phone number already exist';
            } else {
              this.isLoading = false;
              this.addAdmin = true;
              this.showError = true;
              this.message = 'Something went wrong';
            }
          })
          .catch(() => {
            this.isLoading = false;
          });
      }, 2000);
    }
  }

  validate(): Boolean {
    var validEmail = true;
    var validPassword = true;
    var validName = true;
    var validNumber = true;

    if (!this.validateEmail(this.email)) {
      this.invalidEmail = true;
      validEmail = false;
      setTimeout(() => {
        this.invalidEmail = false;
      }, 2000);
    }

    if (this.password.length < 8) {
      this.invalidPassword = true;
      validPassword = false;
      setTimeout(() => {
        this.invalidPassword = false;
      }, 2000);
    }

    if (this.name.length < 3) {
      this.invalidName = true;
      validName = false;
      setTimeout(() => {
        this.invalidName = false;
      }, 2000);
    }

    if (this.number.length != 10) {
      this.invalidNumber = true;
      validName = false;
      setTimeout(() => {
        this.invalidNumber = false;
      }, 2000);
    }

    if (
      validPassword == true &&
      validEmail == true &&
      validName == true &&
      validNumber == true
    ) {
      return true;
    } else {
      return false;
    }
  }

  validateEmail(inputText: String) {
    if (inputText.length < 7) {
      return false;
    }

    if (!inputText.includes('@') || !inputText.includes('.')) {
      return false;
    }

    return true;
  }
}
