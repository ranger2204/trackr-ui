import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '../../services/search.service'
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserData } from '../../models/UserData';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

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
  keywordChanged = new Subject<string>();
  search_list: Array<any>;
  hostAddress: string = ""

  private storage: string = "settings";

  constructor(private searchService: SearchService, private router:Router, private loginService: AuthenticationService) { 
    this.searchForm = this.createSearchForm()
    this.keywordChanged.pipe(debounceTime(800), distinctUntilChanged()).subscribe((event:any) => this.onMutateSearch(event.target.value))
  }

  setSettings(userData: UserData){
    let data = JSON.stringify(userData)
    console.log(`Set Storage : ${data}`)
    localStorage.setItem(this.storage, data)
  }

  updateHostAddress(event){
    this.hostAddress = event.target.value
    console.log(`Host address : ${this.hostAddress}`)
    localStorage.setItem('hostAddress', this.hostAddress)
  }

  getSettings(){
    let data = localStorage.getItem(this.storage)
    let userData = new UserData()
    try{
      this.loginService.userData = Object.assign(userData, JSON.parse(data))
      console.log(`Get Storage : ${data}`)
      this.loginService.updateAuthentication()
    }
    catch(err){
      console.log("Unable to get local storage data")
    }
  }

  logout(){
    //TODO backend call to blacklist token for this username
    console.log(`logging out ${this.loginService.userData.username}`)
    this.loginService.userData.invalidate()
    this.loginService.updateAuthentication()
  }

  ngOnInit(): void {
    let auth_data = this.getSettings()
    this.hostAddress = localStorage.getItem('hostAddress')
    if(this.hostAddress == null)
      localStorage.setItem('hostAddress', 'http://192.168.0.157:5000/')
      this.hostAddress = localStorage.getItem('hostAddress')

    this.loginService.currentMessage.subscribe(msg => {
      console.log(`IN Header msg : ${msg}`)
      try{
        let userData = new UserData()
        userData = Object.assign(userData, JSON.parse(msg))
        this.setSettings(userData)
        this.username = userData.username
        this.authenticated = userData.authenticated
      }
      catch{
        console.log();
      }
    })

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
    // if(searchKey.length!=0){

    // }
    this.router.navigate(['/search', searchKey])
  }

  onMutateSearch(keyword: string){
    if(keyword.length!=0){
      console.log(`Searching : ${keyword}`)
      this.searchService.search(keyword, 1, this.hostAddress).subscribe((response:any) => {
        if(response.status == 1){
          this.search_list = response.data
          console.log(this.search_list)
        }
      })
    }
    else{
      this.search_list = []
    }

  }

}
