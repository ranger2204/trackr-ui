import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FilterConfig, SearchResultItem } from '../models/SearchPage';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  getTLD() {
    return localStorage.getItem('hostAddress') || environment.url;
  }

  getUpdateStats() {
    let baseURL = this.getTLD();
    let url = `${baseURL}/update_history/`;
    return this.http.get(url);
  }

  getMatchingTags(tagText: string) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        tagText: tagText,
      },
    });
  }

  getTags(items: SearchResultItem[]) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/tag/`;
    return this.http.get(url, {
      params: {
        itemIds: items.map((item: SearchResultItem) => item.item_id).join(','),
      },
    });
  }

  addTag(itemId: string, tagText: String) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/tag/`;
    return this.http.put(url, {
      itemId: itemId.toString(),
      tagText: tagText,
    });
  }

  removeTag(tagId: string, itemId: string) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/tag/`;
    return this.http.delete(url, {
      params: {
        tagId: tagId.toString(),
        itemId: itemId.toString(),
      },
    });
  }

  putItem(itemURL: string) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/fetch_item/`;
    return this.http.put(url, {
      item_url: itemURL,
    });
  }

  removeItem(item_id: string) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/fetch_item/`;
    return this.http.delete(url, {
      params: {
        item_id: item_id,
      },
    });
  }

  search(filters: FilterConfig, page_no: number = 1) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/fetch_item/`;
    return this.http.get(url, {
      params: {
        keyword: filters.keyword,
        tags: filters.tags,
        price: filters.price,
        page_no: page_no.toString(),
      },
    });
  }

  getItemPriceHisory(item_id: string) {
    let baseURL = this.getTLD();
    let url = `${baseURL}/fetch_price/`;
    return this.http.get(url, {
      params: {
        item_id: item_id,
      },
    });
  }
}
