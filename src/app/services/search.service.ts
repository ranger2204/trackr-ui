import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  getTLD(hostAddress: string = undefined){
    hostAddress = localStorage.getItem("hostAddress")
    if(hostAddress == undefined)
      return environment.url
    return hostAddress
  }

  getUpdateStats(hostAddress: string = undefined){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/update_history/`;
    return this.http.get(url)
  }

  getAllGroups(hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`;
    return this.http.get(url, {
      params: {
        'groupId': '-1'
      }
    })
  }

  getMatchingTags(tagText){
    let baseURL = this.getTLD(null)
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        'tagText': tagText
      }
    })
  }

  getTags(items, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        'itemIds': items.map(i => i.item_id).join(',')
      }
    })
  }

  addTag(itemId: Number, tagText: String, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/tag/`;
    return this.http.put(url, {
      'itemId': itemId.toString(),
      'tagText': tagText
    })
  }

  removeTag(tagId: Number, itemId: Number, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/tag/`;
    return this.http.delete(url, {
      params: {
        'tagId': tagId.toString(),
        'itemId': itemId.toString()
      }
    })
  }

  getGroup(groupId: Number, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`;
    return this.http.get(url, {
      params: {
        'groupId': groupId.toString()
      }
    })
  }

  createGroup(groupName: String,hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`;
    return this.http.post(url, {
      'groupName': groupName
    })
  }

  toggleItemEmailFlag(itemId: string, hostAddress: string){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}item/${itemId}/update`;
    return this.http.put(url, {
        'update_type': 'toggle_email_flag'
      }
    )
  }

  getItem(item_url:any, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/fetch_item/`
    return this.http.post(url, {
      'item_url': item_url
    })
  }

  putItem(item_url: any, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/fetch_item/`;
    return this.http.put(url, {
      'item_url': item_url
    })
  }

  removeItem(item_id: string, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/fetch_item/`;
    return this.http.delete(url, {
      params: {
        'item_id': item_id
      }
    })
  }

  search(filters: any, page_no: number=1, hostAddress: string = null){
    console.log(filters)
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/fetch_item/`;
    return this.http.get(url, {
      params: {
        'keyword': filters['keyword'],
        'tags': filters['tags'],
        'price': filters['price'],
        'page_no': page_no.toString()
      }
    })
  }

  getItemPriceHisory(item_id: string, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/fetch_price/`;
    return this.http.get(url, {
      params: {
        'item_id': item_id,
      }
    })
  }

  addGroupItem(groupId: Number, itemId: Number, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`;
    return this.http.put(url, {
      'groupId': groupId.toString(),
      'itemId': itemId.toString()
    })
  }

  removeGroup(groupId: Number, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`;
    return this.http.delete(url, {
      params: {
        'groupId': groupId.toString()
      }
    })
  }

  removeGroupItem(gId: Number, hostAddress: string = null){
    let baseURL = this.getTLD(hostAddress)
    let url = `${baseURL}/groups`
    return this.http.delete(url, {
      params: {
        'gId': gId.toString()
      }
    })
  }



}
