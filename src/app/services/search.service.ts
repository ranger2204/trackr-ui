import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  getItem(item_url:any){
    let url = `${environment.url}/fetch_item`
    return this.http.post(url, {
      'item_url': item_url
    })
  }

  putItem(item_url: any){
    let url = `${environment.url}/fetch_item`;
    return this.http.put(url, {
      'item_url': item_url
    })
  }

  removeItem(item_id: string){
    let url = `${environment.url}/fetch_item`;
    return this.http.delete(url, {
      params: {
        'item_id': item_id
      }
    })
  }

  search(keyword: string, page_no: number=1){
    let url = `${environment.url}/fetch_item`;
    return this.http.get(url, {
      params: {
        'keyword': keyword,
        'page_no': page_no.toString()
      }
    })
  }

  getItemPriceHisory(item_id: string){
    let url = `${environment.url}/fetch_price`;
    return this.http.get(url, {
      params: {
        'item_id': item_id,
      }
    })
  }



}
