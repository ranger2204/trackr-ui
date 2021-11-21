import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { NotifierService } from 'angular-notifier';
import { environment } from 'src/environments/environment'
import {PageEvent} from '@angular/material/paginator';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as Highcharts from 'highcharts';


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

  constructor(private route: ActivatedRoute, 
    private searchService: SearchService, 
    private notifierService: NotifierService,
    public PriceDialog: MatDialog
    ) {
  }
  
  ngOnInit(): void {
    this.hostAddress = localStorage.getItem('hostAddress')
    this.sub = this.route.params.subscribe(params => {
      this.searchKey = params['searchKey']
      if(this.searchKey == undefined)
        this.searchKey = ""
      this.search(this.searchKey)
    })
  }

  updateHostAddress(event){
    this.hostAddress = event.target.value
    console.log(this.hostAddress)
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
    this.search(this.searchKey, event.pageIndex+1)
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

  search(keyword:string, page_no:number=1){
    this.hostAddress = localStorage.getItem('hostAddress')
    console.log(`Searching : ${keyword} : ${this.hostAddress}`)
    this.searchService.search(keyword, page_no, this.hostAddress).subscribe((response:any) => {
      if(response.status == 1){
        this.searchList = response.data
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
