import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslateInitService {
  constructor(private translate: TranslateService) {
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = browserLang === 'fr' ? 'fr' : 'en';
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }
}
