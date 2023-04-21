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
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  chart: any;
  hostAddress: string = "";
  searchKey: string = "";
  searchList: Array<any> = [];
  pageSize: number = 15;
  totalItems: number = 0;
  currentPage: number = 0;
  itemPriceHistory = {};
  updateDateTime = '';
  updateStats = '';
  itemTags: any = {};
  tagList = [];
  allTags = [];
  tagSearchTO: any = null;
  filterOpen = false;
  tagFilter = [];
  priceFilter = [];

  priceStrings: Array<String> = ['all_time_low', 'lower_than_first'];

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private notifierService: ToastrService,
    public PriceDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.hostAddress = localStorage.getItem('hostAddress') || "";
    this.getAllTags();
    this.route.params.subscribe((params) => {
      this.searchKey = params['searchKey'];

      if (this.searchKey == undefined) this.searchKey = '';
      let filters = this.createFilters(
        this.searchKey,
        this.tagFilter,
        this.priceFilter
      );
      this.search(filters);
    });
  }

  createFilters(keyword: any, tagFilter: any, priceFilter: any) {
    let filters = {
      keyword: keyword,
      tags: tagFilter.join(','),
      price: priceFilter.join(','),
    };
    return filters;
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

  updateArray(source: Array<any>, tag: string) {
    let index = source.indexOf(tag);
    if (index == -1) source.push(tag);
    else source.splice(index, 1);
  }

  updatePriceFilter(tag: any) {
    this.updateArray(this.priceFilter, tag);
  }

  inFilter(filterArray: any, tag: any) {
    return filterArray.indexOf(tag) != -1;
  }

  getAllTags() {
    this.tagSearchTO = setTimeout(() => {
      this.searchService.getMatchingTags('').subscribe((resp: any) => {
        this.allTags = resp.data;
        console.log(this.allTags);
      });
    }, 1000);
  }

  getMatchingTags(itemId: number, element: any) {
    // console.log(element)
    let tag = element.value;
    if (tag.slice(-1) == ' ') {
      this.addTag(itemId, tag.trim());
      element.value = '';
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

  toggleItemEmailFlag(event: any, itemId: any) {
    this.searchService.toggleItemEmailFlag(itemId, localStorage.getItem('hostAddress') || "").subscribe({
      next: (resp) => {
        console.log(resp);
        switch ((resp as any)['data'][0]['item_email_flag']) {
          case '1':
            event.source.checked = true;
            break;
          case '0':
            event.source.checked = false;
            break;
          default:
            break;
        }
      },
      error: (error) => {
        event.source.checked = !event.checked;
      },
    });
  }

  chartDataConverter(items: Array<any>) {
    let result = [];
    for (let item of items) {
      let row = [];
      for (let key of ['item_price_update_datetime', 'item_price']) {
        row.push(item[key]);
      }
      result.push(row);
    }
    console.table(result);
    return result;
  }

  getUpdateStats() {
    this.searchService
      .getUpdateStats(localStorage.getItem('hostAddress') || "")
      .subscribe((resp: any) => {
        this.updateStats = `${resp.data['upd_missed_items']}/${resp.data['upd_total_items']}`;
        this.updateDateTime = `${resp.data['upd_end_datetime']}`;
      });
  }

  getPriceHistory(item_id: string): void {
    if (item_id in this.itemPriceHistory) {
      this.PriceDialog.open(PriceDialog, {
        width: '60%',
        data: (this.itemPriceHistory as any)[item_id],
      });
    } else {
      this.searchService
        .getItemPriceHisory(item_id, localStorage.getItem('hostAddress') || "")
        .subscribe((response: any) => {
          if (response.status == 1) {
            // this.itemPriceHistory[item_id] = this.chartDataConverter(response.data)
            console.log(response.data);
            (this.itemPriceHistory as any)[item_id] = response.data;
            this.notifierService.success(response.message);
            this.PriceDialog.open(PriceDialog, {
              width: '60%',
              data: (this.itemPriceHistory as any)[item_id],
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
      .removeItem(item_id, localStorage.getItem('hostAddress') || "")
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.notifierService.success(response.message);
          this.search(this.searchKey, this.currentPage);
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

  checkTags(inTags: Array<any>, tag: string) {
    for (let i = 0; i < inTags.length; i++) {
      let t = inTags[i];
      if (t.tag_text === tag) return 1;
    }
    return -1;
  }

  addTag(itemId: any, event: Event | string) {
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
    console.log((this.itemTags as any)[itemId]);
    if (this.checkTags((this.itemTags as any)[itemId], tag) == -1)
      this.searchService.addTag(itemId, tag).subscribe((resp: any) => {
        (this.itemTags as any)[itemId] = resp.data[itemId];
        // console.log(this.itemTags)
      });
    else {
      console.log(`${tag} already exists for ${itemId}`);
    }
  }

  removeTag(tagId: any, itemId: any) {
    this.searchService.removeTag(tagId, itemId).subscribe((resp: any) => {
      (this.itemTags as any)[itemId] = resp.data[itemId];
    });
  }

  search(filters: any, page_no: number = 1) {
    console.log(filters);
    let keyword = filters['keyword'];
    this.getUpdateStats();
    console.log(`Searching : ${keyword} : ${localStorage.getItem('hostAddress')}`);
    this.searchService
      .search(filters, page_no, localStorage.getItem('hostAddress') || "")
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.searchList = response.data;
          this.itemTags = {};
          for (let i = 0; i < this.searchList.length; i++) {
            let item = this.searchList[i];
            (this.itemTags as any)[item.item_id] = [];
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
    @Inject(MAT_DIALOG_DATA) public data: Array<any>
  ) {}

  createChart(data: any) {
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
