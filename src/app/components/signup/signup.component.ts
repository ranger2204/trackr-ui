import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signUpForm: FormGroup;

  constructor() { 
    this.signUpForm = this.createSignUpForm()
  }

  createSignUpForm(){
    return new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      email: new FormControl()
    })
  }

  ngOnInit(): void {
  }

}
