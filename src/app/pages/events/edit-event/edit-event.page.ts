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
import { ActionSheetController, Platform, Events, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

const STORAGE_KEY = 'upload_events_pictures';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.page.html',
  styleUrls: ['./edit-event.page.scss'],
})
export class EditEventPage implements OnInit {
  eventId: any = 0;
  images: any = [];
  formData: FormData = new FormData();
  // data = require('src/states-and-districts.json');
  states = [];
  districts = [];
  types = ['Personal', 'Business', 'Social'];
  description;
  fileName;
  users: any = [];
  array: any = [];

  eventDetailData: any = [];
  date: string;
  time: string;
  loadedImages: any = [];
  sausage: boolean = false;
  isPublic = 1;
  deleteUploadedImage: any = {};

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
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.eventId);

    this.userListing();
    this.getEventData();

  }

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadStoredImages();
    });
  }

  getEventData() {
    this.apis.eventDetail(this.eventId).subscribe((eventData: any) => {
      console.log(eventData);
      this.eventDetailData = eventData.data;
      console.log(this.eventDetailData);
      console.log(this.eventDetailData.user_id);
      console.log(this.global.currentUser.id);

      if (this.eventDetailData.is_public === "1") {
        this.sausage = true;
        console.log('true::::;;');
      } else {
        this.sausage = false;
        console.log('false::::;;');
      }
     

      this.loadedImages = this.eventDetailData.images;
      console.log(this.loadedImages);
      this.date = this.eventDetailData.start_date_time.slice(0, 10);
      this.time = this.eventDetailData.start_date_time.slice(11, 16);
      console.log(this.eventDetailData.start_date_time.slice(0, 10));
    });
  }

  async deleteLoadedImages(image, position) {
    console.log(image);
    const loading = await this.loadingController.create({
      message: 'Deleting image...',
    });

    await loading.present();
    let params = {
      user_id: this.global.currentUser.id,
      image_id: image.image_id
    }
    console.log(params);
    console.log(position);
    this.apis.deleteEventImage(params).subscribe((resData: any) => {
      console.log(resData);
      loading.dismiss();
      if (resData.status) {
        this.global.showMsg('File removed Sucessfully.');
        this.loadedImages.splice(position, 1);
        console.log(this.loadedImages);
      } else {
        this.global.showMsg(resData.message);
      }
    });

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
        let dirPathSegments = dirPath.split('/'); // breaking the string into array
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
    let formData: FormData = new FormData();
    formData.append('attachment', blob, filename);
    formData.append('user_id', this.global.currentUser.id);
    formData.append('id', this.eventDetailData.user_id);
    this.apis.updateAttachment(formData).subscribe((resData: any) => {
      console.log(resData);

      if (resData.status) {
        this.storage.remove(STORAGE_KEY);
        this.presentToast('File upload complete.')
      } else {
        this.global.showMsg(resData.message);
      }
    });
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

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
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
      // this.startUpload(newEntry);
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

  startUpload(imgEntry, pos) {
    this.deleteUploadedImage = {
      image: imgEntry,
      position: pos
    }
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
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });

      // append all info into form 
      this.formData.append('image', imgBlob, file.name);
      this.formData.append('user_id', this.global.currentUser.id);
      this.formData.append('id', this.eventDetailData.id);

      console.log('Final Form Data::::::::', this.formData);


      this.uploadImageData(this.formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    const loading = await this.loadingController.create({
      message: 'Uploading image...',
    });

    await loading.present();

    this.apis.uploadEditEventImages(formData).subscribe(
      (result: any) => {
        console.log(result);
        loading.dismiss();
        // this.global.showMsg(result.message);

        if (result.status) {
          // this.deleteImage(this.deleteUploadedImage.image, this.deleteUploadedImage.position);
          this.storage.remove(STORAGE_KEY);
          this.global.showMsg(result.message);
          // this.presentToast('File upload complete.')

        } else {
          this.global.showError(result.message);
          this.presentToast('File upload failed.')
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
    console.log(form.value.aboutEvent);

    let params = {
      id: this.eventDetailData.id,
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
    params.invited_users = this.array;

    console.log(params);

    const loading = await this.loadingController.create({
      message: 'Adding Data...',
    });

    this.apis.updateEvent(params).subscribe((resData: any) => {
      console.log('Server Response:::::::', resData);
      loading.dismiss();
      if (resData.status) {
        this.global.showMsg(resData.message);
      } else {
        this.global.showError(resData.message);
      }
    });

    form.reset();
  }

}
