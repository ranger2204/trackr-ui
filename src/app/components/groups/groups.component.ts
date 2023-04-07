import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups: Array<any> = []
  newGroupName: string = ""
  newItem: any = {}
  currentGroupItems = []
  currentGroup: any = {}
  itemSearchList = []
  itemSearchKey = ''
  currentItem: any = {
    'item_name': ''
  }

  hostAddress = ""

  

  itemSearchTO = null;

  constructor(
    private dataService: SearchService
  ) { }

  ngOnInit(): void {
    this.hostAddress = localStorage.getItem('hostAddress')
    this.getAllGroups()
  }

  getAllGroups(){
    this.dataService.getAllGroups().subscribe((resp:any) => {
      this.groups = resp.data['groups']
      console.log(this.groups)
    })
  }

  createGroup(){
    this.dataService.createGroup(this.newGroupName).subscribe(resp => {
      this.getAllGroups()
    })
  }

  changeGroup(group){
    console.log(group)
    this.currentGroup = group
    this.dataService.getGroup(group.group_id).subscribe((resp:any) => {
      this.currentGroupItems = resp.data.items
      console.log(this.currentGroupItems)
      this.drawPriceTrend()
    })
  }

  removeGroup(groupId){
    this.dataService.removeGroup(groupId).subscribe(resp => {
      this.getAllGroups()
    })
  }

  removeItemFromGroup(gId){
    this.dataService.removeGroupItem(gId).subscribe(resp => {
      this.changeGroup(this.currentGroup)
    })
  }

  addItemToGroup(){
  
    this.dataService.addGroupItem(this.currentGroup.group_id, this.currentItem.item_id).subscribe(resp => {
      this.changeGroup(this.currentGroup)
      this.currentItem = {
        'item_name': ''
      }
    })
  }


  onMutateItemSearch(keyword: string){
    let createTO = () => {
      this.itemSearchTO = setTimeout(() => {
        if(keyword.length!=0){

          console.log(`Searching : ${keyword}`)
          this.dataService.search({'keyword': keyword, 'tags': '', 'price':''}, 1, this.hostAddress).subscribe((response:any) => {
            if(response.status == 1){
              this.itemSearchList = response.data
              console.log(this.itemSearchList)
            }
          })
        }
      }, 1000)
    }

    if(this.itemSearchTO == null)
      createTO()

    else{
      clearTimeout(this.itemSearchTO)
      createTO()
    }
  }

  getCommon(a_: Array<String>, b_:Array<String>){
    let a = new Set(a_)
    let b = new Set(b_)
    let inter = new Set()
    for(var x of a){
      if(b.has(x))
        inter.add(x)
    }

    return Array.from(inter)
  }

 async drawPriceTrend(){

    let dates:Array<any> = null
    let date_prices: any = {}
    let item_prices:any = {}

    for(let i=0;i<this.currentGroupItems.length;i++){
      let item = this.currentGroupItems[i]
      // console.log(item)
      let resp:any = await this.dataService.getItemPriceHisory(item.item_id).toPromise()
      item_prices[item.item_name] = {}
      if(dates == null){
        dates = resp.data.date
        for(let k=0;k<dates.length;k++){
          let cdate = dates[k]
          // if(resp.data.prices_min[k] == -1 || resp.data.prices_max[k] == -1)
          //   continue
          date_prices[cdate] = {
            'min_price' : resp.data.prices_min[k],
            'max_price' : resp.data.prices_max[k]
          }
          
        }
        item_prices[item.item_name] = JSON.parse(JSON.stringify(date_prices))
        dates = Object.keys(date_prices)
      }
      else{
        let cdate_prices = {}
        for(let k=0;k<resp.data.date.length;k++){
          let cdate = resp.data.date[k]
          // if(resp.data.prices_min[k] == -1 || resp.data.prices_max[k] == -1)
          //   continue
          cdate_prices[cdate] = {
            'min_price' : resp.data.prices_min[k],
            'max_price' : resp.data.prices_max[k]
          }
          

        }
        item_prices[item.item_name] = cdate_prices
        let commonDates:Array<any> = this.getCommon(dates, Object.keys(cdate_prices))
        console.log(commonDates)
        for(let k=0;k<commonDates.length;k++){
          let cdate:string = commonDates[k]
          date_prices[cdate]['min_price'] += cdate_prices[cdate]['min_price']
          date_prices[cdate]['max_price'] += cdate_prices[cdate]['max_price']
        }
        dates = commonDates
      }
      console.log(dates)
    }

      let date_min_price = Object.keys(date_prices).map(function(v, i) {
        return [Date.parse(v), date_prices[v]['min_price']];
      });
  
      let date_max_price = Object.keys(date_prices).map(function(v, i) {
        return [Date.parse(v), date_prices[v]['max_price']];
      });

      let plotData = [
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
            enabled: true
          }
        }
      ]
      console.log(item_prices)
      Object.keys(item_prices).forEach((item_name) => {
          let item_min_price = Object.keys(date_prices).map(function(v, i) {
          try{
            return [Date.parse(v), item_prices[item_name][v]['min_price']];
          }
          catch(err){
            console.log(`${item_name} - ${v}`)
            return [Date.parse(v), -1]
          }
        });
        plotData.push({
          name: item_name,
          data: item_min_price,
          marker: {
            enabled: true
          }
        })
      })

      

      this.drawChart(plotData)
  }
  

  drawChart(plotData){
    let chart_options: any = {
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

    chart_options["series"] = plotData;

    Highcharts.chart('group_price_chart', chart_options);

  }
}
  






