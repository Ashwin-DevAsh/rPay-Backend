import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginService } from '../login/LoginService';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  constructor(private loginService: LoginService) {}

  private helper = new JwtHelperService();

  allBlocks = [];
  allBlocksTemp: Array<any> = [];
  blocks = [];
  pageIndex = 0;

  async getBlocks() {
    var response;
    try {
      response = await axios.get(this.loginService.url + 'getBlocks', {
        headers: { token: this.loginService.token },
      });

      this.allBlocks = response.data.rows;
      this.allBlocksTemp = response.data.rows;
      console.log(this.allBlocks);
    } catch (e) {
      response = { data: { err: e } };
      this.allBlocks = [];
    }
  }

  filter(query: String) {
    this.pageIndex = 0;
    this.allBlocks = [];
    for (var i = 0; i < this.allBlocksTemp.length; i++) {
      if (
        this.allBlocksTemp[i].blockid
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        console.log(this.allBlocksTemp[i]);
        this.allBlocks.push(this.allBlocksTemp[i]);
      }
    }
  }

  getNext(isMove = false): Array<any> {
    if (isMove) this.pageIndex += 1;
    this.blocks = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allBlocks.length;
      i++
    ) {
      console.log(this.allBlocks[i]);
      this.blocks.push({
        ...this.allBlocks[i],
        data: this.helper.decodeToken(this.allBlocks[i].encrypteddata),
        index: i + 1,
      });
      console.log(this.allBlocks[i]);
    }
    return this.blocks;
  }

  getPrev(): Array<any> {
    this.pageIndex -= 1;
    this.blocks = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allBlocks.length;
      i++
    ) {
      this.blocks.push({
        ...this.allBlocks[i],
        data: this.helper.decodeToken(this.allBlocks[i].encrypteddata),
        index: i + 1,
      });
    }
    return this.blocks;
  }
}
