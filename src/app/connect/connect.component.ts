import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TranslateModule } from '@ngx-translate/core';
import { WelcomeComponent } from './welcome/welcome.component';

@Component({
  selector: 'app-connect',
  imports: [
    CommonModule,
    WelcomeComponent,
    LoginComponent,
    RegisterComponent,
    TranslateModule,
  ],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css',
})
export class ConnectComponent {
  isRegistering: boolean = false;
  isLogin: boolean = false;
  page: string = '';

  toggleLoginOrRegister(page: string) {
    if (page === 'login' && !this.isLogin) {
      this.isLogin = true;
      this.isRegistering = false;
    } else if (
      (page === 'register' || page === 'buy' || page === 'subscribe') &&
      !this.isRegistering
    ) {
      this.page = page;
      this.isLogin = false;
      this.isRegistering = true;
    } else {
      this.isLogin = false;
      this.isRegistering = false;
    }
  }
}
