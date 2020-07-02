import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signUpForm: FormGroup;
  error: string;

  constructor() { 
    this.signUpForm = this.createSignUpForm()
    this.error = ""
  }

  createSignUpForm(){
    return new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      email: new FormControl()
    })
  }

  onSubmit(){
    console.log(this.signUpForm)
    this.error = "Error!"
  }

  ngOnInit(): void {
  }

}
