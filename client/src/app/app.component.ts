import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FilesUploadComponent } from './files-upload/files-upload.component';
import { FindPhotosComponent } from './find-photos/find-photos.component';
import { ICustomEvent, eventType } from './fileModel';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatCardModule,
    FilesUploadComponent,
    FindPhotosComponent,
    MatProgressBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Welcome to find person from Album!';
  isUploadedPhotos: boolean = false;
  error: string = ""
  message: string = ""
  notificationTime: number = 5000;
  isProcess: boolean = false;


  public uploadEventHandler(findImageEvent: ICustomEvent) {
    switch (findImageEvent.type) {
      case eventType.NOTIFICATION:
        this.error = findImageEvent.data.errorMsg != undefined ? findImageEvent.data.errorMsg : "";
        this.message = findImageEvent.data.successMsg != undefined ? findImageEvent.data.successMsg : "";
        this.clearNotification();
        break;
      case eventType.PHOTOS_UPLOADED:
        this.isUploadedPhotos = findImageEvent.data;
        break;
      case eventType.PROCESS:
        this.isProcess = findImageEvent.data;
        break;
      default:
        break;
    }
  }

  private clearNotification() {
    setTimeout(() => { this.error = "", this.message = "" }, this.notificationTime)
  }
}
