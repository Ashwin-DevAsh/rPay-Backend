import { Component, OnInit } from '@angular/core';
import { BlockService } from './BlockService';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
})
export class BlocksComponent implements OnInit {
  constructor(public blockService: BlockService) {}

  isLoading = true;
  blocks = [];
  pageStatus = 'Showing 0 to 0 of 0';

  async ngOnInit() {
    await this.blockService.getBlocks();
    this.blocks = this.blockService.getNext(false);
    this.pageStatus = `Showing ${this.blocks[0].index} to ${
      this.blocks[this.blocks.length - 1].index
    } of ${this.blockService.allBlocks.length}`;
    this.isLoading = false;
  }

  filter(query: String) {
    this.isLoading = true;
    this.blockService.filter(query);
    this.blocks = this.blockService.getNext();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  nav(next = true) {
    this.isLoading = true;
    if (next) {
      this.blocks = this.blockService.getNext(true);
    } else {
      this.blocks = this.blockService.getPrev();
    }
    this.pageStatus = `Showing ${this.blocks[0].index} to ${
      this.blocks[this.blocks.length - 1].index
    } of ${this.blockService.allBlocks.length}`;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }
}
