import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '../../services/search.service'
import { Router } from '@angular/router';
import { keyframes } from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  authenticated: boolean;
  username: string;
  token: string;
  searchForm: FormGroup;
  error: string;

  constructor(private searchService: SearchService, private router:Router) { 
    this.searchForm = this.createSearchForm()
    this.authenticated = false;
    this.username = 'rangerz';
    this.token = ''
  }

  ngOnInit(): void {
  }

  createSearchForm(){
    return new FormGroup({
      searchKey: new FormControl()
    })
  }

  onSubmit(){
    // console.log(this.searchForm)
    let searchKey = this.searchForm.value.searchKey
    if(!this.searchForm.value.searchKey)
      searchKey = ''
    this.router.navigate(['/search', searchKey])
  }

}
