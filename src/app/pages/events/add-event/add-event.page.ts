import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';

import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ActionSheetController, Platform, Events, LoadingController } from '@ionic/angular';
import { element } from 'protractor';

const STORAGE_KEY = 'upload_events_pictures';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.page.html',
  styleUrls: ['./add-event.page.scss'],
})
export class AddEventPage {
  images: any = [];
  formData: FormData = new FormData();
  // data = require('src/states-and-districts.json');
  states = [];
  districts = [];
  types = ['Personal', 'Business', 'Social'];
  description;
  fileName;
  users: any = [];
  formPostInfo: any = {};
  finalPostInfo: any = {};
  sausage: boolean = true;
  array: any = [];
  isPublic = 1;

  arr: any;
  constructor(
    private apis: ApisService,
    public global: GlobalProvider,
    private actionSheetController: ActionSheetController,
    private filePath: FilePath,
    private camera: Camera,
    private file: File,
    private storage: Storage,
    private plt: Platform,
    private webview: WebView,
    private ref: ChangeDetectorRef,
    public events: Events,
    private fileChooser: FileChooser,
    private loadingController: LoadingController,
    ) {
      this.userListing();
  }

  userListing() {
    this.apis.listUsers().subscribe((userData: any) => {
      console.log(userData);
      this.users = userData.data;
      console.log(this.users);
    })
  }

  choose() {
    this.fileChooser.open().then(uri => {
      // alert(uri);

      this.filePath.resolveNativePath(uri).then(filePath => {
        alert(JSON.stringify(filePath));

        let dirPath = filePath;
        console.log(filePath);
        let dirPathSegments = dirPath.split('/'); // break the string into array
        let filename = dirPathSegments.pop();  // remove its last element
        console.log(filename);
        dirPath = dirPathSegments.join('/');

        this.file.readAsArrayBuffer(dirPath, filename).then(buffer => {
          this.upload(buffer, filename);
        })
      })
      console.log(uri)
    })
    .catch(e => console.log(e));
  }

  upload(buffer, filename) {
    let blob = new Blob([buffer], { type: filename.type });
    this.formData.append('attachment', blob, filename);
    
    this.fileName = filename;
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    });
  }

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    console.log('namePath:', namePath)
    console.log('currentName:', currentName)
    console.log('newFileName:', newFileName)
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      this.global.showMsg('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      // if (!arr) {
      let newImages = [name];
      this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      // } else {
      //   arr.push(name);
      //   this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      // }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle

      // direct upload image
      this.startUpload(newEntry);
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.global.showMsg('File removed.');
      });
    });
  }

  startUpload(imgEntry) {
    this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file))
      })
      .catch(err => {
        console.log('err:::::::::', err)
        this.global.showMsg('Error while reading file.');
      });
  }

  readFile(file: any) {
    console.log('read file function is called');
    const reader = new FileReader();
    reader.onload = () => {
      // const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });

      // append all info into form 
      this.formData.append('images[]', imgBlob, file.name);
 ;

      console.log('Final Form Data::::::::', this.formData);

      // this.uploadImageData(this.formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    this.global.showloading();

      this.apis.addEvent(formData).subscribe((resData: any) => {
      console.log('Server Response:::::::', resData);
      this.global.hideloading();
      if (resData.status) {
        this.global.showMsg(resData.message);
      } else {
        this.global.showError(resData.message);
      }
    },
    (err: any) => {
      this.global.hideloading();
      this.global.showMsg(err);
      console.log(err);
    });
    
  }

  async onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    console.log(form.value.invite);
    console.log(form.value.eventType);

    if (this.sausage) {
      this.isPublic = 1;
    } else {
      this.isPublic = 0;
    }

    this.formPostInfo = { 
      user_id: this.global.currentUser.id,
      title: form.value.eventName,
      event_type: form.value.eventType,
      description: this.description,
      address: form.value.address,
      start_date_time: form.value.startDate,
      end_date_time: form.value.endDate,
      is_public: this.isPublic,
      invited_users: form.value.invite
    }
    
    if (!this.sausage) {
      console.log(form.value.invite.length);
      for (let index = 0; index < form.value.invite.length; index++) {
        this.array[index] = form.value.invite[index];
      }
    } 
    
    console.log(this.array);
    this.formPostInfo.invited_users = this.array;
    console.log(this.formPostInfo);

    this.finalPostInfo.formPostInfo = JSON.stringify(this.formPostInfo);

    this.formData.append('formPostInfo', this.finalPostInfo.formPostInfo);


    const formData = new FormData();
  
    // append all info into form 
    console.log('this.finalPostInfo.formPostInfo', this.finalPostInfo.formPostInfo);
    console.log('this.formData.get(attachment)', this.formData.get('attachment'));

    formData.append('formPostInfo', this.finalPostInfo.formPostInfo);
    formData.append('images[]', this.formData.get('images[]'));
    formData.append('attachment', this.formData.get('attachment'));

    let formValues = this.formPostInfo;
    let formfields = Object.keys(this.formPostInfo);
    console.log('formfields:::::',formfields);
    formfields.forEach(function(item, index) {
      formData.append(item, formValues[item]);
      console.log(formValues[item]);
    });

    console.log('Final Form Data::::::::', this.formData);

    const loading = await this.loadingController.create({
      message: 'Adding Data...',
    });

    await loading.present();
    this.apis.addEvent(this.formData).subscribe((resData: any) => {
      
      console.log('Server Response:::::::', resData);
      loading.dismiss();
      if (resData.status) {
        this.global.showMsg(resData.message);
      } else {
        this.global.showError(resData.message);
      }
    },
    (err: any) => {
      loading.dismiss();
      this.global.showMsg(err);
      console.log(err);
  });
    form.reset();
  }


}
