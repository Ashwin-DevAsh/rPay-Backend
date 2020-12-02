import { Component, OnInit } from '@angular/core';
import { UserService } from '../UserService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listusers',
  templateUrl: './listusers.component.html',
  styleUrls: ['./listusers.component.scss'],
})
export class ListusersComponent implements OnInit {
  constructor(public userService: UserService, public router: Router) {}

  isLoading = true;
  users = [];
  colors = this.userService.colors;
  pageStatus = 'Showing 0 to 0 of 0';

  searchMode = 'Name';

  searchModes = ['Number', 'Email', 'Name'];

  async ngOnInit() {
    await this.userService.getUsers();
    this.users = this.userService.getNext(false);
    this.pageStatus = `Showing ${this.users[0].index} to ${
      this.users[this.users.length - 1].index
    } of ${this.userService.allUsers.length}`;
    this.isLoading = false;
  }

  filter(query: String) {
    this.isLoading = true;
    switch (this.searchMode) {
      case 'Number': {
        this.userService.filterWithNumber(query);
        break;
      }

      case 'Name': {
        this.userService.filterWithName(query);
        break;
      }

      case 'Email': {
        this.userService.filterWithEmail(query);
        break;
      }
    }
    this.users = this.userService.getNext();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  nav(next = true) {
    if (next) {
      this.users = this.userService.getNext(true);
    } else {
      this.users = this.userService.getPrev();
    }
    this.pageStatus = `Showing ${this.users[0].index} to ${
      this.users[this.users.length - 1].index
    } of ${this.userService.allUsers.length}`;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  async openUsersProfile(item: Object) {
    this.userService.selectedUser = item;
    localStorage.setItem('selectedUser', JSON.stringify(item));
    this.router.navigate(['/Home/AllUsers/UserProfile']);
  }
}
