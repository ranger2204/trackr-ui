import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';
import { SearchResultItem } from 'src/app/models/SearchPage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  searchForm: FormGroup;
  keywordChanged = new Subject<KeyboardEvent>();
  search_list: SearchResultItem[] = [];
  hostAddress: string = '';

  constructor(private searchService: SearchService, private router: Router) {
    this.searchForm = this.createSearchForm();
    this.keywordChanged
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((event: any) => this.onMutateSearch(event.target.value));
  }

  updateHostAddress(event: Event) {
    this.hostAddress = (event.target as HTMLInputElement).value;
    console.log(`Host address : ${this.hostAddress}`);
    localStorage.setItem('hostAddress', this.hostAddress);
  }

  ngOnInit(): void {
    this.hostAddress =
      localStorage.getItem('hostAddress') || 'http://192.168.0.157:5000/';
  }

  createSearchForm() {
    return new FormGroup({
      searchKey: new FormControl(),
    });
  }

  onSubmit() {
    let searchKey = this.searchForm.value.searchKey;
    if (!this.searchForm.value.searchKey) searchKey = '';
    this.router.navigate(['/search', searchKey]);
  }

  onMutateSearch(keyword: string) {
    if (keyword.length != 0) {
      this.searchService
        .search({ keyword: keyword, tags: '', price: '' }, 1, this.hostAddress)
        .subscribe((response: any) => {
          if (response.status == 1) {
            this.search_list = response.data;
          }
        });
    } else {
      this.search_list = [];
    }
  }
}
