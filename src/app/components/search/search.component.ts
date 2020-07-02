import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchKey: string;
  private sub: any;
  constructor(private route: ActivatedRoute) {
   }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.searchKey = params['searchKey']
    })
  }

}
