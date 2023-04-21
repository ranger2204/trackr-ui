import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  getTLD(hostAddress: string = undefined) {
    hostAddress = localStorage.getItem('hostAddress');
    if (hostAddress == undefined) return environment.url;
    return hostAddress;
  }

  getUpdateStats(hostAddress: string = undefined) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/update_history/`;
    return this.http.get(url);
  }

  getMatchingTags(tagText) {
    let baseURL = this.getTLD(null);
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        tagText: tagText,
      },
    });
  }

  getTags(items, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        itemIds: items.map((i) => i.item_id).join(','),
      },
    });
  }

  addTag(itemId: Number, tagText: String, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/tag/`;
    return this.http.put(url, {
      itemId: itemId.toString(),
      tagText: tagText,
    });
  }

  removeTag(tagId: Number, itemId: Number, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/tag/`;
    return this.http.delete(url, {
      params: {
        tagId: tagId.toString(),
        itemId: itemId.toString(),
      },
    });
  }

  toggleItemEmailFlag(itemId: string, hostAddress: string) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}item/${itemId}/update`;
    return this.http.put(url, {
      update_type: 'toggle_email_flag',
    });
  }

  putItem(item_url: any, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/fetch_item/`;
    return this.http.put(url, {
      item_url: item_url,
    });
  }

  removeItem(item_id: string, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/fetch_item/`;
    return this.http.delete(url, {
      params: {
        item_id: item_id,
      },
    });
  }

  search(filters: any, page_no: number = 1, hostAddress: string = null) {
    console.log(filters);
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/fetch_item/`;
    return this.http.get(url, {
      params: {
        keyword: filters['keyword'],
        tags: filters['tags'],
        price: filters['price'],
        page_no: page_no.toString(),
      },
    });
  }

  getItemPriceHisory(item_id: string, hostAddress: string = null) {
    let baseURL = this.getTLD(hostAddress);
    let url = `${baseURL}/fetch_price/`;
    return this.http.get(url, {
      params: {
        item_id: item_id,
      },
    });
  }
}
