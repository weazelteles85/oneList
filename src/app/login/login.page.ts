import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isLogin = true;
  buttonText = 'login';
  LoginForm: FormGroup;
  loginMessage: string;


  constructor(public authService: AuthService) { }

  ngOnInit() {
    if(!this.isLogin) {
      this.buttonText = 'register';
    }

    this.LoginForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'passConfirm': new FormControl('')
    });
  }

  onGoogleLoginClick() {
    try {
      this.authService.signInWithGoogle();  
    } catch (error) {
      console.log(error);
      this.loginMessage = "There was a problem Logging in, error: " + error + " Please email us at inbox@telesApps.com";
    }  
  }

  setLogin(value:boolean) {
    console.log('setLogin called');
    this.isLogin = value;
    if(!this.isLogin) {
      this.buttonText = 'register';
      this.ngOnInit();
    } else { 
      this.buttonText = 'login'
      this.ngOnInit();
    }
  }

  onLoginOrRegister() {
    if(this.isLogin) {
      this.authService.signinWithEmailAndPassword(this.LoginForm.get('email').value, this.LoginForm.get('password').value);
    }
    else {
      this.authService.registerNewUser(this.LoginForm.get('email').value, this.LoginForm.get('passConfirm').value);

    }
  }

  checkIfMatch() {
    console.log('check called');
    if(!this.isLogin) {
      if(this.LoginForm.get('password').value != this.LoginForm.get('passConfirm').value) {
        this.loginMessage = 'Passwords does not match';
        this.LoginForm.setErrors({'valid': false});
      }
      else {
        this.loginMessage = '';
      }
    } 
  }

}
