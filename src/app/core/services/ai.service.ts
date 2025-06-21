import { Inject, Injectable } from '@angular/core';
import { getGenerativeModel, GenerativeModel, AI } from 'firebase/ai';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private model: GenerativeModel;

  constructor(@Inject('AI') private ai: AI) {
    this.model = getGenerativeModel(this.ai, { model: 'gemini-2.5-flash' });
  }

  generate(prompt: string): Observable<string> {
    const promise = this.model.generateContent(prompt).then((result) => {
      return result.response.text();
    });

    return from(promise);
  }
}
