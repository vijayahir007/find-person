import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ICustomEvent, eventType } from '../fileModel';
import { FindPhotosService } from './find-photos.service';
import { appConstant } from '../constant';

const materialModules = [
  MatToolbarModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule
];

@Component({
  selector: 'app-find-photos',
  standalone: true,
  imports: [
    CommonModule,
    materialModules
  ],
  templateUrl: './find-photos.component.html',
  styleUrl: './find-photos.component.css'
})
export class FindPhotosComponent {

  fileName: string = 'Search Photo';
  currentFile: File | undefined;
  searchDisabled: boolean = true;

  matchPhotos : string[] = [];
  imageBaseUrl : string = `${appConstant.imageUrl}/`;
  noMatchFoundMsg: string = "";

  @Output() searchPhotoEvent: EventEmitter<ICustomEvent> = new EventEmitter();

  constructor(
    private findPhotosService: FindPhotosService
  ) { }

  ngOnInit() {
  }

  selectFile(event: any): void {
    this.fileName = "";
    if (event.target.files.length > 0) {
      this.searchDisabled = false;
      this.currentFile = event.target.files[0]
      this.fileName = this.currentFile ? this.currentFile?.name : "Search Photo";
    } else {
      this.searchDisabled = true;
      this.fileName = 'Search Photo';
    }
  }

  search(): void {
    this.noMatchFoundMsg = "";
    if (this.currentFile) {
      this.matchPhotos = [];
      this.searchDisabled = true;
      this.processStartStop(true);
      this.findPhotosService.searchPerson(this.currentFile).subscribe(data => {
        // handle the data
        if (data instanceof HttpResponse) {
          const result = data.body;
          if(result.noMatch == 1) {
            this.noMatchFoundMsg = "A person is not found in the album!"
          }

          this.searchDisabled = false;
          this.processStartStop(false);
          if (result.isSuccess) {
            this.currentFile = undefined;
            this.matchPhotos = result.data;
            this.searchPhotoEvent.emit({ type: eventType.NOTIFICATION, data: { successMsg: result.message } });
          } else {            
            this.searchPhotoEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: result.message } });
          }
        }
      },
        error => {
          this.searchDisabled = false;
          this.processStartStop(false);
          this.searchPhotoEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: appConstant.commonError } });
        });
    }
  }

  private processStartStop(isProcessStart: boolean) {
    this.searchPhotoEvent.emit({ type: eventType.PROCESS, data: isProcessStart });
  }

}
