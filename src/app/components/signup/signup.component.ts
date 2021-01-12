import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from 'src/app/services/authentication.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signUpForm: FormGroup;
  message: string;

  constructor(private registerService: AuthenticationService, private notifier: NotifierService) { 
    this.signUpForm = this.createSignUpForm()
    this.message = ""
  }

  createSignUpForm(){
    return new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      email: new FormControl()
    })
  }

  onSubmit(){
    this.registerService.register(this.signUpForm.value).subscribe((response:any) => {
      this.notifier.notify('success', response.message)
    },
    error => {
      this.notifier.notify("error", error.name)
    })
  }

  ngOnInit(): void {
  }

}
