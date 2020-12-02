import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginService } from '../login/LoginService';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor(private loginService: LoginService) {}

  allNodes = [];
  allNodesTemp: Array<any> = [];
  nodes = [];
  pageIndex = 0;

  async getNodes() {
    var response;
    try {
      response = await axios.get(this.loginService.url + 'getNodes', {
        headers: { token: this.loginService.token },
      });

      this.allNodes = response.data.rows;
      this.allNodesTemp = response.data.rows;
      console.log(this.allNodes);
    } catch (e) {
      response = { data: { err: e } };
      this.allNodes = [];
    }
  }

  filter(query: String) {
    this.pageIndex = 0;
    this.allNodes = [];
    for (var i = 0; i < this.allNodesTemp.length; i++) {
      if (this.allNodesTemp[i].id.toLowerCase().includes(query.toLowerCase())) {
        console.log(this.allNodesTemp[i]);
        this.allNodes.push(this.allNodesTemp[i]);
      }
    }
  }

  getNext(isMove = false): Array<any> {
    if (isMove) this.pageIndex += 1;
    this.nodes = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allNodes.length;
      i++
    ) {
      this.nodes.push({ ...this.allNodes[i], index: i + 1 });
      console.log(this.allNodes[i]);
    }
    return this.nodes;
  }

  getPrev(): Array<any> {
    this.pageIndex -= 1;
    this.nodes = [];
    for (
      var i = 0 + this.pageIndex * 20;
      i < (this.pageIndex + 1) * 20 && i < this.allNodes.length;
      i++
    ) {
      this.nodes.push({ ...this.allNodes[i], index: i + 1 });
    }
    return this.nodes;
  }
}
