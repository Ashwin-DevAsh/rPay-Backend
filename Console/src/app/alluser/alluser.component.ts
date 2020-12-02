import { Component, OnInit } from '@angular/core';
import { UserService } from './UserService';

@Component({
  selector: 'app-alluser',
  templateUrl: './alluser.component.html',
  styleUrls: ['./alluser.component.scss'],
})
export class AlluserComponent implements OnInit {
  constructor(public userService: UserService) {}

  async ngOnInit() {
    this.userService.selectedUser = JSON.parse(
      localStorage.getItem('selectedUser')
    );
  }
}
