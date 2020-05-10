import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";
import { Storage } from '@ionic/storage';
import { NgForm, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ActionSheetController, NavController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { finalize } from 'rxjs/operators';

const STORAGE_KEY = 'profile_main_image';

@Component({
  selector: 'app-addprofile',
  templateUrl: 'add-profile.page.html',
  styleUrls: ['add-profile.page.scss'],
})
export class AddProfilePage implements OnInit {

  images = [];

  addProfileForm: FormGroup;
  educations: FormArray;
  gotras: FormArray;
  relatives: FormArray;
  contactPersons: FormArray;

  profile_detail: any = { basic: {} }
  allStaticAndDynamicLists: any = {};
  citiesStates: any = {};
  cities: any = {};

  formPostInfo: any = {};
  finalPostInfo: any = {};

  active: string = 'radio-1';

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
    private filePath: FilePath
  ) {

    this.addProfileForm = formBuilder.group({

      //basic
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      gender: ['', Validators.compose([Validators.pattern('[a-zA-Z]*'), Validators.required])],
      dob: ['', Validators.compose([Validators.required])],
      birth_time: ['', Validators.compose([Validators.required])],
      birth_place: ['', Validators.compose([Validators.required])],
      marital_status_id: ['', Validators.compose([Validators.pattern('[0-9]*'), Validators.required])],
      height: ['', Validators.compose([Validators.pattern('[0-9.]*'), Validators.required])],
      complexion: ['', Validators.compose([Validators.required])],
      highest_education_id: ['', Validators.compose([Validators.pattern('[0-9]*')])],

      // address
      state_id: ['', Validators.compose([Validators.required])],
      district_id: ['', Validators.compose([Validators.required])],
      village: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*')])],
      address: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*')])],
      pincode: ['', Validators.compose([Validators.pattern('[0-9]*')])],

      //others
      no_of_brothers: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      no_of_sisters: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      about_profile: [''],

      //occupation
      job_id: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      income: ['', Validators.compose([Validators.pattern('[0-9-]*')])],
      job_description: [''],

      // other form array
      educations: this.formBuilder.array([this.educationForm()]),
      gotras: this.formBuilder.array([this.gotraForm()]),
      relatives: this.formBuilder.array([this.relativeForm()]),
      contactPersons: this.formBuilder.array([this.contactPersonForm()]),
    });
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

  educationForm(): FormGroup {
    return this.formBuilder.group({
      education_id: ['', Validators.compose([Validators.pattern('[0-9]*'), Validators.required])],
      passing_year: ['', Validators.compose([Validators.required])],
      institute: ['', Validators.compose([Validators.required])],
    });
  }

  addMoreEducation() {
    this.educations = this.addProfileForm.get('educations') as FormArray;
    this.educations.push(this.educationForm());
  }

  removeEducation(index) {
    this.educations.removeAt(index);
  }

  gotraForm(): FormGroup {
    return this.formBuilder.group({
      gotra_type: ['', Validators.compose([Validators.required])],
      gotra_name: ['', Validators.compose([Validators.pattern('[a-zA-Z]*'), Validators.required])],
    });
  }

  addMoreGotra() {
    this.gotras = this.addProfileForm.get('gotras') as FormArray;
    this.gotras.push(this.gotraForm());
  }

  removeGotra(index) {
    this.gotras.removeAt(index);
  }

  relativeForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      mobile: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      email: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z@._]*')])],
      job_id: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      state_id: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      address: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z@._ ]*')])],
      remark: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z@._ ]*')])],
      relation: ['', Validators.compose([Validators.pattern('[a-zA-Z ]*'), Validators.required])],
    });
  }

  addMoreRelative() {
    this.relatives = this.addProfileForm.get('relatives') as FormArray;
    this.relatives.push(this.relativeForm());
  }

  removeRelative(index) {
    this.relatives.removeAt(index);
  }

  contactPersonForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      mobile: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      email: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z@._]*')])],
      remark: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z@._ ]*')])],
      contact_time: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z -]*'), Validators.required])],
    });
  }

  addMoreContactPerson() {
    this.contactPersons = this.addProfileForm.get('contactPersons') as FormArray;
    this.contactPersons.push(this.contactPersonForm());
  }

  removeContactPerson(index) {
    this.contactPersons.removeAt(index);
  }

  saveProfile() {
    console.log('save profile form submitted');

    this.formPostInfo = {};
    
    // user-id
    this.formPostInfo.user_id = this.global.currentUser.id;

    // basic
    this.formPostInfo.basic = {
      name: this.addProfileForm.value.name,
      gender: this.addProfileForm.value.gender,
      dob: this.addProfileForm.value.dob,
      birth_time: this.addProfileForm.value.birth_time,
      birth_place: this.addProfileForm.value.birth_place,
      marital_status_id: this.addProfileForm.value.marital_status_id,
      height: this.addProfileForm.value.height,
      complexion: this.addProfileForm.value.complexion,
      highest_education_id: this.addProfileForm.value.highest_education_id,
    };

    // address
    this.formPostInfo.address = {
      state_id: this.addProfileForm.value.state_id,
      district_id: this.addProfileForm.value.district_id,
      village: this.addProfileForm.value.village,
      address: this.addProfileForm.value.address,
      pincode: this.addProfileForm.value.pincode,
    };

    //occupation
    let job_incomes = this.addProfileForm.value.income.split('-');
    this.formPostInfo.occupation = {
      job_id: this.addProfileForm.value.job_id,
      income_min: job_incomes[0],
      income_max: job_incomes[1],
      job_description: this.addProfileForm.value.job_description,
    };

    //others
    this.formPostInfo.others = {
      no_of_brothers: this.addProfileForm.value.no_of_brothers,
      no_of_sisters: this.addProfileForm.value.no_of_sisters,
      about_profile: this.addProfileForm.value.about_profile,
    };

    this.formPostInfo.educations = this.addProfileForm.value.educations;
    this.formPostInfo.gotras = this.addProfileForm.value.gotras;
    this.formPostInfo.relatives = this.addProfileForm.value.relatives;
    this.formPostInfo.contactPersons = this.addProfileForm.value.contactPersons;

    this.finalPostInfo.formPostInfo = JSON.stringify(this.formPostInfo);
    console.log('Final Form Data::::::::', this.finalPostInfo.formPostInfo);

    /*this.apis.createProfile(this.finalPostInfo).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();

        if (result.status) {
          console.log('file uploaded successfully.')
          this.global.showMsg('File upload complete.')
        } else {
          this.global.showMsg(result.message);
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });*/


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
      formData.append('main_image', imgBlob, file.name);
      formData.append('formPostInfo', this.finalPostInfo.formPostInfo);

      console.log('Final Form Data::::::::', formData);

      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    this.global.showloading();

    this.apis.createProfile(formData).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        this.global.showMsg(result.message);

        if (result.status) {
          this.storage.remove(STORAGE_KEY);
          this.navCtrl.navigateRoot('/my-profiles');
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

}
