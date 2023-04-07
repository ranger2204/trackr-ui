import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserData } from '../models/UserData'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private messageSource = new BehaviorSubject('authentication');
  currentMessage = this.messageSource.asObservable();
  userData: UserData;

  constructor(private http: HttpClient) { 
  }

  login(data:any){
    let url = `${environment.url}/login`;
    return this.http.post(url, {
      'username': data.username,
      'password': data.password
    });
  }

  register(userDetails:any){
    let url = `${environment.url}/signup`
    return this.http.post(url, userDetails);
  }

  updateAuthentication() {
    this.messageSource.next(JSON.stringify(this.userData))
  }
}
