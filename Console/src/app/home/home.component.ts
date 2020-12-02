import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/LoginService';

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  drawerOpen: Boolean = false;
  currentPageIndex: Number = 0;
  userName: String;

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    console.log(this.drawerOpen);
  }

  isCurrentPage(myPage: string) {
    return this.router.url.includes(myPage);
  }

  selectPage(page: String) {
    console.log('hello');
    this.router.navigate([`Home/${page}`]);
  }

  constructor(private router: Router, public loginService: LoginService) {}

  onClick() {
    // var profileCard = document.querySelector('.profile-card');
    // if (profileCard.classList.contains('profile-card-open')) {
    //   profileCard.classList.remove('profile-card-open');
    // }
    // console.log('Clicked.');
  }

  logout() {
    localStorage.removeItem('token');
    this.loginService.token = '';
    this.router.navigate(['/Login'], { replaceUrl: true });
  }

  async ngOnInit() {
    if (!this.loginService.isSessionExist()) {
      this.router.navigate(['Login'], { replaceUrl: true });
      return;
    }

    this.userName = this.loginService.userName;
  }
}
