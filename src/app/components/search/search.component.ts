import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { NotifierService } from 'angular-notifier';
import { environment } from 'src/environments/environment'
import {PageEvent} from '@angular/material/paginator';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { ThrowStmt } from '@angular/compiler';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchKey: string;
  searchList:Array<any>;
  private sub: any;
  environment: any = environment
  pageSize:number = 15;
  totalItems:number = 0;
  currentPage:number = 0;
  itemPriceHistory = {}
  hostAddress = ""
  updateDateTime = ""
  updateStats = ""
  itemTags = {}
  tagList = []
  allTags = []
  tagSearchTO = null;
  filterOpen = false;
  tagFilter = []
  priceFilter = []

  priceStrings: Array<String> = ["all_time_low", 'lower_than_first']

  constructor(private route: ActivatedRoute, 
    private searchService: SearchService, 
    private notifierService: NotifierService,
    public PriceDialog: MatDialog
    ) {
  }
  
  ngOnInit(): void {
    this.hostAddress = localStorage.getItem('hostAddress')
    this.getAllTags()
    this.sub = this.route.params.subscribe(params => {
      this.searchKey = params['searchKey']
      
      if(this.searchKey == undefined)
        this.searchKey = ""
      let filters = this.createFilters(this.searchKey, this.tagFilter, this.priceFilter)
      this.search(filters)
    })
  }

  createFilters(keyword, tagFilter, priceFilter){
    let filters = {
      'keyword': keyword,
      'tags': tagFilter.join(','),
      'price': priceFilter.join(',')
    }
    return filters
  }

  updateTagFilter(tag: string){
    this.updateArray(this.tagFilter, tag)
  }

  getRevised(){
    let filters = this.createFilters(this.searchKey, this.tagFilter, this.priceFilter)
    this.search(filters)
  }

  updateArray(source:Array<any>, tag: string){
    let index = source.indexOf(tag)
    if(index == -1)
      source.push(tag)
    else
      source.splice(index, 1)
  }

  updatePriceFilter(tag){
    this.updateArray(this.priceFilter, tag)
  }

  inFilter(filterArray, tag){
    return filterArray.indexOf(tag) != -1
  }

  updateHostAddress(event){
    this.hostAddress = event.target.value
    console.log(this.hostAddress)
  }

  getAllTags(){
    this.tagSearchTO = setTimeout(()=>{
      this.searchService.getMatchingTags("").subscribe((resp: any) => {
        this.allTags = resp.data
        console.log(this.allTags)
      })
    }, 1000)
  }

  getMatchingTags(itemId: number, element: any){
    // console.log(element)
    let tag = element.value;
    if(tag.slice(-1) == ' '){
      this.addTag(itemId, tag.trim())
      element.value = ''
      return
    }
    if(tag.length < 2)
      return
    if(this.tagSearchTO != null){
      clearTimeout(this.tagSearchTO)
    }
    this.tagSearchTO = setTimeout(()=>{
      this.searchService.getMatchingTags(tag).subscribe((resp: any) => {
        this.tagList = resp.data
      })
    }, 1000)
  }

  toggleItemEmailFlag(event, itemId){
    this.hostAddress = localStorage.getItem('hostAddress')
    this.searchService.toggleItemEmailFlag(itemId, this.hostAddress).subscribe(resp => {
      console.log(resp)
      switch (resp['data'][0]['item_email_flag']) {
        case '1':
          event.source.checked = true;
          break;
        case '0':
          event.source.checked = false;
          break;
        default:
          break;
      }
      
    }, error => {
      event.source.checked = !event.checked
    })

  }

  chartDataConverter(items: Array<any>){
    let result = []
    for(let item of items){
      let row = []
      for(let key of ['item_price_update_datetime', 'item_price']){
        row.push(item[key])
      }
      result.push(row)
    }
    console.table(result)
    return result
  }

  getUpdateStats(){
    this.searchService.getUpdateStats(this.hostAddress).subscribe((resp:any) => {
      this.updateStats = `${resp.data['upd_missed_items']}/${resp.data['upd_total_items']}`
      this.updateDateTime = `${resp.data['upd_end_datetime']}`
    })
  }

  getPriceHistory(item_id: string): void{
    this.hostAddress = localStorage.getItem('hostAddress')
    if(item_id in this.itemPriceHistory){
      const dialogRef = this.PriceDialog.open(PriceDialog, {
        width: '60%',
        data: this.itemPriceHistory[item_id]
      });
    }
    else{
      this.searchService.getItemPriceHisory(item_id, this.hostAddress).subscribe((response:any) => {
        if(response.status == 1){
          // this.itemPriceHistory[item_id] = this.chartDataConverter(response.data)
          console.log(response.data)
          this.itemPriceHistory[item_id] = response.data
          this.notifierService.notify('success', response.message)
          const dialogRef = this.PriceDialog.open(PriceDialog, {
            width: '60%',
            data: this.itemPriceHistory[item_id]
          });
        }
        else{
          this.notifierService.notify('success', response.message)
        }
      })
    }

    

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   this.animal = result;
    // });

  }

  changePage(event:PageEvent){
    this.currentPage = event.pageIndex + 1
    let filters = this.createFilters(this.searchKey, this.tagFilter, this.priceFilter)
    this.search(filters, event.pageIndex+1)
  }

  trim(name:string, max_chars=100){
    return name.slice(0, max_chars)
  }

  removeItem(item_id:string){
    this.searchService.removeItem(item_id, this.hostAddress).subscribe((response:any) => {
      if(response.status == 1){
        this.notifierService.notify('success', response.message)
        this.search(this.searchKey, this.currentPage)
      }
      else{
        this.notifierService.notify('success', response.message)
      }
    })
  }

  getTags(){
    this.searchService.getTags(this.searchList).subscribe((resp: any) => {
      this.itemTags = resp.data
    })
  }

  toggleFilterTab(){
    this.filterOpen = !this.filterOpen
    // if(this.filterOpen){
    //   document.getElementById('sidenav-filter').style.width = '50%'
    // }
    // else{
    //   document.getElementById('sidenav-filter').style.width = '0px'
    // }

  }


  checkTags(inTags: Array<any>, tag: string){
    for(let i=0;i<inTags.length;i++)
    {
      let t = inTags[i]
      if(t.tag_text === tag)
        return 1
    }
    return -1
  }

  addTag(itemId, tag: string){
    if(tag == null){
      let inp = document.getElementById("input-"+itemId) as HTMLInputElement
      tag = inp.value
    }
    if(tag.length == 0)
      return
    console.log(this.itemTags[itemId])
    if(this.checkTags(this.itemTags[itemId], tag) == -1)
      this.searchService.addTag(itemId, tag).subscribe((resp: any) => {
        
        this.itemTags[itemId] = resp.data[itemId]
        // console.log(this.itemTags)
      })
    else{
      console.log(`${tag} already exists for ${itemId}`)
    }
  }

  removeTag(tagId, itemId){
    this.searchService.removeTag(tagId, itemId).subscribe((resp: any) => {
      this.itemTags[itemId] = resp.data[itemId]
      // console.log(this.itemTags)
    })
  }

  search(filters, page_no:number=1){
    console.log(filters)
    let keyword = filters['keyword']
    this.getUpdateStats()
    this.hostAddress = localStorage.getItem('hostAddress')
    console.log(`Searching : ${keyword} : ${this.hostAddress}`)
    this.searchService.search(filters, page_no, this.hostAddress).subscribe((response:any) => {
      if(response.status == 1){
        this.searchList = response.data
        this.itemTags = {}
        for(let i=0;i<this.searchList.length;i++){
          let item = this.searchList[i]
          this.itemTags[item.item_id] = []
        }
        this.getTags()

        this.totalItems = response.total
        console.log(this.searchList)
        this.currentPage = 1
        this.notifierService.notify('success', response.message)
      }
      else{
        this.notifierService.notify('success', response.message)
        this.searchList = []
      }
    })
  }

}

@Component({
  selector: 'price-dialog',
  templateUrl: 'price-dialog.html',
})
export class PriceDialog {

  chart_options: any = {
    chart: {
      type: 'spline'
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    xAxis: {
      type: "datetime",
      // labels: {
      //   format: '{value:%Y-%m-%d}'
      // },
    },
    yAxis: {
      title: {
        text: "Price"
      }
    },
    tooltip: {
      shared: true,
      crosshairs: true
    },
    plotOptions: {
      areaspline: {
          fillOpacity: 0.5
      }
    },
    series: [{ data: [], pointStart: 1 }]
  };

  constructor(
    public dialogRef: MatDialogRef<PriceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Array<any>) {}

  ngOnInit(){

    let data = this.data
  
    let date_min_price = data["prices_min"].map(function(v, i) {
      return [Date.parse(data["date"][i]), v];
    });

    let date_max_price = data["prices_max"].map(function(v, i) {
      return [Date.parse(data["date"][i]), v];
    });

    this.chart_options["series"] = [

      {
        name: "Min Price",
        data: date_min_price,
        // color: Highcharts.getOptions().colors[1],
        marker: {
          enabled: true
        }

      },
      {
        name: "Max Price",
        data: date_max_price,
        // color: Highcharts.getOptions().colors[2],
        marker: {
          enabled: false
        }
      }
    ];

    Highcharts.chart('price_chart', this.chart_options);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
