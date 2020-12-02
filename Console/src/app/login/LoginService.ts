import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor() {}

  public url: String = 'http://3.15.27.159:4500/';
  public endPoint: String = 'login';
  public userName: String = localStorage.getItem('userName');
  public email: String = localStorage.getItem('email');
  public phoneNumber: String = localStorage.getItem('phoneNumber');
  public imageURL: String = localStorage.getItem('imageURL');
  public token: string = localStorage.getItem('token');

  public isSessionExist(): Boolean {
    var jwtHelper = new JwtHelperService();
    try {
      var decodedToken = jwtHelper.decodeToken(this.token);
      if (!decodedToken.name) {
        return false;
      }
    } catch {
      return false;
    }

    console.log(this.token);
    return !jwtHelper.isTokenExpired(this.token);
  }
}

interface Result {
  message: String;
}
