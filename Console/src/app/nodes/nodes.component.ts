import { Component, OnInit } from '@angular/core';
import { NodeService } from './NodeService';

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss'],
})
export class NodesComponent implements OnInit {
  constructor(public nodeService: NodeService) {}

  isLoading = true;
  nodes = [];
  pageStatus = 'Showing 0 to 0 of 0';

  async ngOnInit() {
    await this.nodeService.getNodes();
    this.nodes = this.nodeService.getNext(false);
    this.pageStatus = `Showing ${this.nodes[0].index} to ${
      this.nodes[this.nodes.length - 1].index
    } of ${this.nodeService.allNodes.length}`;
    this.isLoading = false;
  }

  filter(query: String) {
    this.isLoading = true;
    this.nodeService.filter(query);
    this.nodes = this.nodeService.getNext();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  nav(next = true) {
    if (next) {
      this.nodes = this.nodeService.getNext(true);
    } else {
      this.nodes = this.nodeService.getPrev();
    }
    this.pageStatus = `Showing ${this.nodes[0].index} to ${
      this.nodes[this.nodes.length - 1].index
    } of ${this.nodeService.allNodes.length}`;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }
}
