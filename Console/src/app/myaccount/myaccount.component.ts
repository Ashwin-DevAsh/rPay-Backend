import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit {
  isLoading = true;

  userName = localStorage.getItem('userName');
  email = localStorage.getItem('email');
  number =
    localStorage.getItem('phoneNumber') != 'undefined'
      ? localStorage.getItem('phoneNumber')
      : '919551574355';

  constructor() {}

  ngOnInit(): void {}
}
