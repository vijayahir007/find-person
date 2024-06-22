import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appConstant } from '../constant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FindPhotosService {
  private baseUrl = appConstant.baseUrl;

  constructor(private http: HttpClient) { }

  searchPerson(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.baseUrl}/search-person`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }
}
