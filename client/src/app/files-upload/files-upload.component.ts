import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FilesUploadService } from './files-upload.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ICustomEvent, eventType } from '../fileModel';
import { MatIconModule } from '@angular/material/icon';
import { appConstant } from '../constant';

const materialModules = [
  MatToolbarModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule
];

@Component({
  selector: 'app-files-upload',
  standalone: true,
  imports: [
    ...materialModules,
    CommonModule,
  ],
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css']
})
export class FilesUploadComponent implements OnInit {
  @Output() uploadFilesEvent: EventEmitter<ICustomEvent> = new EventEmitter();

  currentFiles: File[] = [];
  progress = 0;

  fileName = 'Select Files';
  isFilesUploaded: boolean = false;

  constructor(private uploadService: FilesUploadService) {

  }

  async ngOnInit(): Promise<void> {
    await this.getUploadedFiles()
  }

  selectFile(event: any): void {
    this.progress = 0;
    this.fileName = "";
    if (event.target.files.length > 0) {
      for (const file of event.target.files) {
        this.currentFiles.push(file);
        this.fileName = this.fileName != "" ? `${this.fileName}, ${file.name}` : `${file.name}`;
      }
    } else {
      this.fileName = 'Select Files';
    }
  }

  upload(): void {
    if (this.currentFiles.length) {
      this.processStartStop(true);
      this.uploadService.upload(this.currentFiles).subscribe(data => {
        // handle the data
        if (data instanceof HttpResponse) {
          this.processStartStop(false);
          if (data.body.isSuccess) {
            this.currentFiles = [];
            this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { successMsg: data.body.message } });
          } else {
            this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: data.body.message } });
          }
          this.getUploadedFiles();
        }
      },
        error => {
          this.processStartStop(false);
          this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: appConstant.commonError } });
        });
    }
  }

  private getUploadedFiles(): void {
    this.processStartStop(true);
    this.uploadService.getFileList().subscribe(result => {
      this.processStartStop(false);
      if (result.isSuccess) {
        const fileList = result.data.list as string[];
        this.isFilesUploaded = fileList.length > 0;
        this.photoUploadedEvent();
        if (this.isFilesUploaded) {
          this.fileName = fileList.join(", ");
        } else {
          this.fileName = "Select Files";
        }
      } else {
        this.isFilesUploaded = false;
        this.photoUploadedEvent();
        this.fileName = "Select Files";
      }
    },
      error => {
        this.processStartStop(false);
        this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: appConstant.commonError } });
      });
  }

  public clearFile(): void {
    this.processStartStop(true);
    this.uploadService.clearFileList().subscribe(result => {
      this.processStartStop(false);
      if (result.isSuccess) {
        this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { successMsg: result.message } });
      } else {
        this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: result.message } });
      }
      this.getUploadedFiles();
    },
      error => {
        this.processStartStop(false);
        this.uploadFilesEvent.emit({ type: eventType.NOTIFICATION, data: { errorMsg: appConstant.commonError } });
      });
  }

  private processStartStop(isProcessStart: boolean) {
    this.uploadFilesEvent.emit({ type: eventType.PROCESS, data: isProcessStart });
  }

  private photoUploadedEvent() {
    this.uploadFilesEvent.emit({ type: eventType.PHOTOS_UPLOADED, data: this.isFilesUploaded });
  }

}