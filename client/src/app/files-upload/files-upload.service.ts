import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appConstant } from '../constant';

@Injectable({
  providedIn: 'root'
})
export class FilesUploadService {
  private baseUrl = appConstant.baseUrl;

  constructor(private http: HttpClient) { }

  upload(files: File[]): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    for(const file of files)
      formData.append('files', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFileList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get_files`);
  }
  
  clearFileList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clear_files`);
  }
}