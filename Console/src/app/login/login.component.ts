import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './LoginService';
import axios from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, private loginService: LoginService) {}
  ngOnInit(): void {}

  email: String = localStorage.getItem('email');
  password: String = '';
  invalidEmail: Boolean = false;
  invalidPassword: Boolean = false;
  isLoading: Boolean = false;

  login() {
    if (this.validate()) {
      this.isLoading = true;
      setTimeout(() => {
        axios
          .post(`${this.loginService.url}${this.loginService.endPoint}`, {
            email: this.email,
            password: this.password,
          })
          .then((res) => {
            console.log(res);
            if (res.data.message === 'done') {
              this.loginService.userName = res.data.name;
              this.loginService.email = res.data.email;
              this.loginService.phoneNumber = '+' + res.data.number;
              this.loginService.imageURL = res.data.imageURL;
              this.loginService.token = res.data.token;
              localStorage.setItem('userName', res.data.name);
              localStorage.setItem('email', res.data.email);
              localStorage.setItem('phoneNumber', res.data.number);
              localStorage.setItem('url', res.data.imageURL);
              localStorage.setItem('token', res.data.token);
              this.isLoading = false;
              this.router.navigate(['/Home'], { replaceUrl: true });
              return;
            } else if (res.data.message === 'invalid password') {
              console.log('Invalid password');
              this.isLoading = false;
              this.invalidPassword = true;
              setTimeout(() => {
                this.invalidPassword = false;
              }, 2000);
              return;
            } else if (res.data.message === 'invalid admin') {
              this.isLoading = false;
              this.invalidEmail = true;
              setTimeout(() => {
                this.invalidEmail = false;
              }, 2000);
              return;
            }
            this.isLoading = false;
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

    if (validPassword == true && validEmail == true) {
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
