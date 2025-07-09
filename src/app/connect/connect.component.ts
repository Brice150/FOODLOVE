import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CgvComponent } from './cgv/cgv.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { WelcomeComponent } from './welcome/welcome.component';

@Component({
  selector: 'app-connect',
  imports: [
    CommonModule,
    WelcomeComponent,
    LoginComponent,
    RegisterComponent,
    CgvComponent,
    TranslateModule,
  ],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css',
})
export class ConnectComponent {
  isRegistering: boolean = false;
  isLogin: boolean = false;
  isCgvActive: boolean = false;
  page: string = '';

  toggleLoginOrRegister(page: string) {
    if (page === 'login' && !this.isLogin) {
      this.isLogin = true;
      this.isRegistering = false;
      this.isCgvActive = false;
    } else if (
      (page === 'register' || page === 'buy' || page === 'subscribe') &&
      !this.isRegistering
    ) {
      this.page = page;
      this.isLogin = false;
      this.isRegistering = true;
      this.isCgvActive = false;
    } else {
      this.isLogin = false;
      this.isRegistering = false;
      this.isCgvActive = false;
    }
  }

  toggleCgv(): void {
    this.isLogin = false;
    this.isRegistering = false;
    this.isCgvActive = true;
  }
}
