import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserData } from 'src/app/models/UserData';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  authenticated: boolean;
  loginForm: FormGroup;
  message: string;

  constructor(private loginService: AuthenticationService) { 
    this.loginForm = this.createloginForm()
    this.message = ""
    this.authenticated = false;
  }

  createloginForm(){
    return new FormGroup({
      username: new FormControl('ranger'),
      password: new FormControl('jyothis'),
    })
  }

  onSubmit(){
    let userData = new UserData()
    userData =  Object.assign(userData, this.loginForm.value)
    this.loginService.login(userData).subscribe((data:any) => {
      if(data.token == undefined){
        // if token not in reply -> error
        this.message = data.message
        return
      }
      userData.authenticate(data.token)
      this.loginService.userData = userData;
      this.loginService.updateAuthentication();
    },
    error => {
      this.message = error.message
    })

  }

  ngOnInit(): void {
    this.loginService.currentMessage.subscribe(auth_data => {
      console.log(`In Login msg : ${auth_data}`)
      let userData: UserData = JSON.parse(auth_data)
      this.authenticated = userData.authenticated
    })
  }

}

