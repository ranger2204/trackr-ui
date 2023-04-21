import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import {
  FilterConfig,
  ItemPriceHistory,
  ItemTag,
  SearchResultItem,
} from 'src/app/models/SearchPage';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  chart: any;
  hostAddress: string = '';
  searchKey: string = '';
  searchList: SearchResultItem[] = [];
  pageSize: number = 15;
  totalItems: number = 0;
  currentPage: number = 0;
  itemPriceHistory: { [item_id: string]: ItemPriceHistory } = {};
  updateDateTime: string = '';
  updateStats: string = '';
  itemTags: { [item_id: string]: ItemTag[] } = {};
  tagList: string[] = [];
  allTags: string[] = [];
  tagSearchTO: ReturnType<typeof setTimeout> | null = null;
  filterOpen: boolean = false;
  tagFilter: string[] = [];
  priceFilter: string[] = [];

  priceStrings: string[] = ['all_time_low', 'lower_than_first'];

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private notifierService: ToastrService,
    public PriceDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.hostAddress = localStorage.getItem('hostAddress') || '';
    this.getAllTags();
    this.route.params.subscribe((params) => {
      this.searchKey = params['searchKey'];

      if (this.searchKey == undefined) this.searchKey = '';
      const filters = this.createFilters(
        this.searchKey,
        this.tagFilter,
        this.priceFilter
      );
      this.search(filters);
    });
  }

  createFilters(
    keyword: string,
    tagFilter: string[],
    priceFilter: string[]
  ): FilterConfig {
    return {
      keyword: keyword,
      tags: tagFilter.join(','),
      price: priceFilter.join(','),
    };
  }

  updateTagFilter(tag: string) {
    this.updateArray(this.tagFilter, tag);
  }

  getRevised() {
    let filters = this.createFilters(
      this.searchKey,
      this.tagFilter,
      this.priceFilter
    );
    this.search(filters);
  }

  updateArray(source: string[], item: string) {
    let index = source.indexOf(item);
    if (index == -1) source.push(item);
    else source.splice(index, 1);
  }

  updatePriceFilter(tag: string) {
    this.updateArray(this.priceFilter, tag);
  }

  inFilter(filterArray: string[], tag: string) {
    return filterArray.indexOf(tag) != -1;
  }

  getAllTags() {
    this.tagSearchTO = setTimeout(() => {
      this.searchService.getMatchingTags('').subscribe((resp: any) => {
        this.allTags = resp.data;
      });
    }, 1000);
  }

  getMatchingTags(itemId: string, element: EventTarget | null) {
    if (!element) return;

    let tag = (element as HTMLInputElement).value;
    if (tag.slice(-1) == ' ') {
      this.addTag(itemId, tag.trim());
      (element as HTMLInputElement).value = '';
      return;
    }
    if (tag.length < 2) return;
    if (this.tagSearchTO != null) {
      clearTimeout(this.tagSearchTO);
    }
    this.tagSearchTO = setTimeout(() => {
      this.searchService.getMatchingTags(tag).subscribe((resp: any) => {
        this.tagList = resp.data;
      });
    }, 1000);
  }

  getUpdateStats() {
    this.searchService
      .getUpdateStats(localStorage.getItem('hostAddress') || '')
      .subscribe((resp: any) => {
        this.updateStats = `${resp.data['upd_missed_items']}/${resp.data['upd_total_items']}`;
        this.updateDateTime = `${resp.data['upd_end_datetime']}`;
      });
  }

  getPriceHistory(item_id: string): void {
    if (item_id in this.itemPriceHistory) {
      this.PriceDialog.open(PriceDialog, {
        width: '60%',
        data: this.itemPriceHistory[item_id],
      });
    } else {
      this.searchService
        .getItemPriceHisory(item_id, localStorage.getItem('hostAddress') || '')
        .subscribe((response: any) => {
          if (response.status == 1) {
            this.itemPriceHistory[item_id] = response.data;
            this.notifierService.success(response.message);
            this.PriceDialog.open(PriceDialog, {
              width: '60%',
              data: this.itemPriceHistory[item_id],
            });
          } else {
            this.notifierService.success(response.message);
          }
        });
    }
  }

  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    let filters = this.createFilters(
      this.searchKey,
      this.tagFilter,
      this.priceFilter
    );
    this.search(filters, event.pageIndex + 1);
  }

  trim(name: string, max_chars = 100) {
    return name.slice(0, max_chars);
  }

  removeItem(item_id: string) {
    this.searchService
      .removeItem(item_id, localStorage.getItem('hostAddress') || '')
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.notifierService.success(response.message);
          let filters = this.createFilters(
            this.searchKey,
            this.tagFilter,
            this.priceFilter
          );
          this.search(filters, this.currentPage);
        } else {
          this.notifierService.success(response.message);
        }
      });
  }

  getTags() {
    this.searchService.getTags(this.searchList).subscribe((resp: any) => {
      this.itemTags = resp.data;
    });
  }

  toggleFilterTab() {
    this.filterOpen = !this.filterOpen;
  }

  checkTags(inTags: ItemTag[], tag: string) {
    for (let i = 0; i < inTags.length; i++) {
      let t = inTags[i];
      if (t.tag_text === tag) return 1;
    }
    return -1;
  }

  addTag(itemId: string, event: Event | string) {
    let tag: string = '';
    if (event instanceof Event) {
      const element = event.currentTarget as HTMLInputElement;
      tag = element.value;
    } else {
      tag = event;
    }

    if (tag == null) {
      let inp = document.getElementById('input-' + itemId) as HTMLInputElement;
      tag = inp.value;
    }
    if (tag.length == 0) return;
    if (this.checkTags(this.itemTags[itemId], tag) == -1)
      this.searchService.addTag(itemId, tag).subscribe((resp: any) => {
        this.itemTags[itemId] = resp.data[itemId];
      });
    else {
      console.log(`${tag} already exists for ${itemId}`);
      let inp = document.getElementById('input-' + itemId) as HTMLInputElement;
      inp.value = '';
    }
  }

  removeTag(tagId: string, itemId: string) {
    this.searchService.removeTag(tagId, itemId).subscribe((resp: any) => {
      this.itemTags[itemId] = resp.data[itemId];
    });
  }

  search(filters: FilterConfig, page_no: number = 1) {
    let keyword = filters.keyword;
    this.getUpdateStats();
    console.log(
      `Searching : ${keyword} : ${localStorage.getItem('hostAddress')}`
    );
    this.searchService
      .search(filters, page_no, localStorage.getItem('hostAddress') || '')
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.searchList = response.data;
          this.itemTags = {};
          for (let i = 0; i < this.searchList.length; i++) {
            let item = this.searchList[i];
            this.itemTags[item.item_id] = [];
          }
          this.getTags();

          this.totalItems = response.total;
          this.currentPage = 1;
          this.notifierService.success(response.message);
        } else {
          this.notifierService.success(response.message);
          this.searchList = [];
        }
      });
  }
}

@Component({
  selector: 'price-dialog',
  templateUrl: 'price-dialog.html',
})
export class PriceDialog {
  chart: any;

  constructor(
    public dialogRef: MatDialogRef<PriceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ItemPriceHistory
  ) {}

  createChart(data: ItemPriceHistory) {
    this.chart = new Chart('PriceChart', {
      type: 'line',
      data: {
        labels: data.date,
        datasets: [
          {
            label: 'Min Price',
            data: data.prices_min,
            backgroundColor: 'blue',
          },
          {
            label: 'Max Price',
            data: data.prices_max,
            backgroundColor: 'red',
          },
        ],
      },
    });
  }

  ngOnInit() {
    this.createChart(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
