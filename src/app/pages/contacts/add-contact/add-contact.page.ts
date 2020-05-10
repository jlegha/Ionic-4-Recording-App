import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../../providers/globals/globals";
import { ApisService } from "../../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { NgForm, Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ActionSheetController, NavController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { finalize } from 'rxjs/operators';
import { element } from 'protractor';

const STORAGE_KEY = 'profile_main_image';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage implements OnInit {

  images = [];

  addContactForm: FormGroup;
  allStaticAndDynamicLists: any = {};
  citiesStates: any = {};
  cities: any = {};
  formPostInfo: any = {};
  finalPostInfo: any = {};
  active: string = 'radio-1';

  public myForm: FormGroup;
  private playerCount: number = 1;
  mobiles: FormArray;
  relatives: FormArray;
  array: any = [];

  constructor(
    public translate: TranslateService,
    public global: GlobalProvider,
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public apis: ApisService,
    private camera: Camera,
    private file: File,
    private http: HttpClient,
    private webview: WebView,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private storage: Storage,
    private plt: Platform,
    private loadingController: LoadingController,
    private ref: ChangeDetectorRef,
    private filePath: FilePath,
  ) {

    this.addContactForm = formBuilder.group({

      // basic
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      email: [''],
      father_husband_name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      dob: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.pattern('[a-zA-Z]*'), Validators.required])],
      marital_status_id: ['', Validators.compose([Validators.pattern('[0-9]*'), Validators.required])],
      // blood_group: ['', Validators.compose([Validators.pattern('[A-Z+-]*'), Validators.required])],
      occupation: ['', Validators.compose([Validators.required])],
      current_posting: ['', Validators.compose([Validators.required])],
      education: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      current_address: ['', Validators.compose([Validators.required])],
      // education_specification: [''],
      // job_id: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      // job_specification: [''],
      native_village: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      facebook_id: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*')])],
      mobiles: this.formBuilder.array([this.mobileForm()]),
      // mobiles: ['', Validators.compose([Validators.pattern('[0-9]*'), Validators.required])],
      relatives: this.formBuilder.array([this.relativeForm()]),
      // relative_name: ['',  Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      // relative_relation: ['',  Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      // other_contact: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      
      // address
      // state_id: ['', Validators.compose([Validators.required])],
      // district_id: ['', Validators.compose([Validators.required])],
      // village: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*')])],
      // address: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*')])],
      // pincode: ['', Validators.compose([Validators.pattern('[0-9]*')])],
    });

    // this.myForm = formBuilder.group({
    //   mobile: ['',  Validators.compose([Validators.pattern('[0-9]*'), Validators.required])]
    // });
  }

  ngOnInit() {

    this.translate.setDefaultLang(this.global.language);

    this.plt.ready().then(() => {
      this.loadStoredImages();
      this.getAllStaticAndDynamicLists();
      this.getCitiesStates();
    });
  }

  accordionClicked(accordionID) {
    this.active = accordionID;
  }

  mobileForm(): FormGroup {
    return this.formBuilder.group({
      mobile: ['', Validators.compose([Validators.pattern('[0-9]*'), Validators.required])],
    });
  }

  addMoreMobilesNumbers() {
    this.mobiles = this.addContactForm.get('mobiles') as FormArray;
    this.mobiles.push(this.mobileForm());
  }

  removeMobileNumber(index) {
    this.mobiles.removeAt(index);
  }

  relativeForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      relation: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
    });
  }

  addMoreRelatives() {
    this.relatives = this.addContactForm.get('relatives') as FormArray;
    this.relatives.push(this.relativeForm());
  }

  removeRelative(index) {
    this.relatives.removeAt(index);
  }

  // addControl(){
  //   this.playerCount++;
  //   this.myForm.addControl('mobile' + this.playerCount, new FormControl('',  Validators.compose([Validators.pattern('[0-9]*'), Validators.required])));
  //   // let count = 'mobile' + this.playerCount;
  //   let count = this.numbers.push(this.myForm.controls.key);
  //   //   .valueChanges.subscribe(change => {
  //   //   console.log(change);
  //   // }));
  //   // count.valueOf
  //   console.log(count);
  //   console.log(this.numbers);
  // }

  // removeControl(control){
  //   this.myForm.removeControl(control.key);
  //   this.numbers.pop();
  // }

  saveContact() {
    console.log('save profile form submitted');

    // this.formPostInfo.user_id = this.global.currentUser.id;
    // console.log(this.formPostInfo.user_id);
    this.formPostInfo = {
      // basic
      user_id: this.global.currentUser.id,
      name: this.addContactForm.value.name,
      email: this.addContactForm.value.email,
      father_husband_name: this.addContactForm.value.father_husband_name,
      dob: this.addContactForm.value.dob,
      gender: this.addContactForm.value.gender,
      marital_status_id: this.addContactForm.value.marital_status_id,
      // blood_group: this.addContactForm.value.blood_group,
      occupation: this.addContactForm.value.occupation,
      current_posting: this.addContactForm.value.current_posting,
      education: this.addContactForm.value.education,
      current_address: this.addContactForm.value.current_address,
      // education_specification: this.addContactForm.value.education_specification,
      // job_id: this.addContactForm.value.job_id,
      // job_specification: this.addContactForm.value.job_specification,
      native_village: this.addContactForm.value.native_village,
      facebook_id: this.addContactForm.value.facebook_id,
      // mobiles: this.addContactForm.value.mobiles,
      // relatives: [
      //   {
      //     name: this.addContactForm.value.relative_name,
      //     relation: this.addContactForm.value.relative_relation
      //   }
      // ]
      // relative_name: this.addContactForm.value.relative_name,
      // relative_relation: this.addContactForm.value.relative_relation,
      // other_contact: this.addContactForm.value.other_contact,

      // // address
      // state_id: this.addContactForm.value.state_id,
      // district_id: this.addContactForm.value.district_id,
      // village: this.addContactForm.value.village,
      // address: this.addContactForm.value.address,
      // pincode: this.addContactForm.value.pincode
    };
    console.log(this.addContactForm.value.mobiles.length);
    for (let index = 0; index < this.addContactForm.value.mobiles.length; index++) {
      this.array[index] = this.addContactForm.value.mobiles[index].mobile;
    }
    console.log(this.array);
    this.formPostInfo.mobiles = this.array;
    // this.addContactForm.value.mobiles.forEach((element, i) => {
    //   this.formPostInfo.mobiles = element.mobile;
    //   console.log(element);
    // });
    // this.formPostInfo.mobiles = this.addContactForm.value.mobiles.mobile;
    this.formPostInfo.relatives = this.addContactForm.value.relatives;
    this.finalPostInfo.formPostInfo = JSON.stringify(this.formPostInfo);
    // this.formPostInfo = JSON.stringify(this.formPostInfo);
    console.log(this.addContactForm.value.mobiles[0].mobile);
    console.log(this.addContactForm.value.mobiles);
    console.log('Final Form Data::::::::', this.formPostInfo);

    // let formValues = this.formPostInfo;
    // let formfields = Object.keys(this.formPostInfo)
    // formfields.forEach(function(item, index) {
    //   console.log(item, ':', formValues[item])
    // })

    // this.apis.createContact(this.formPostInfo).subscribe(
    //   (result: any) => {

    //     console.log(result);
    //     this.global.hideloading();

    //     if (result.status) {
    //       console.log('Saved successfully.')
    //       this.global.showMsg('Saved successfully.')
    //     } else {
    //       this.global.showMsg(result.message);
    //     }
    //   },
    //   (err: any) => {
    //     this.global.hideloading();
    //     this.global.showMsg(err);
    //     console.log(err);
    //   });

    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });

          this.file.resolveLocalFilesystemUrl(filePath)
            .then(entry => {
              (<FileEntry>entry).file(file => this.readFile(file))
            })
            .catch(err => {
              console.log('err:::::::::', err)
              this.global.showMsg('Error while reading file.');
            });
        }
      }
    });
  }

  getAllStaticAndDynamicLists() {
    // this.global.showloading();

    this.apis.getAllStaticAndDynamicLists().subscribe(
      (result: any) => {

        console.log(result);
        // this.global.hideloading();

        if (result.status) {
          this.allStaticAndDynamicLists = result;
        } else {
          this.global.showMsg(result.message);
        }
      },
      (err: any) => {
        // this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

  getCitiesStates() {
    // this.global.showloading();

    this.apis.getCitiesStates().subscribe(
      (result: any) => {

        console.log(result);
        // this.global.hideloading();

        if (result.status) {
          this.citiesStates = result;
        } else {
          this.global.showMsg(result.message);
        }
      },
      (err: any) => {
        // this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

  setStateCities(event) {
    this.cities = this.citiesStates.cities[event.detail.value];
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
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });

      // append all info into form 
      formData.append('image', imgBlob, file.name);
      formData.append('formPostInfo', this.finalPostInfo.formPostInfo);
      let formValues = this.formPostInfo;
      let formfields = Object.keys(this.formPostInfo)
      formfields.forEach(function(item, index) {
        formData.append(item, formValues[item]);
        console.log(formValues[item])
      })

      console.log('Final Form Data::::::::', formData);

      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    this.global.showloading();

    this.apis.createContact(formData).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        this.global.showMsg(result.message);

        if (result.status) {
          this.storage.remove(STORAGE_KEY);
          this.navCtrl.navigateRoot('/contacts');
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

}
