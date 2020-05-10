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
import { ActivatedRoute } from '@angular/router';

const STORAGE_KEY = 'profile_main_image';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.page.html',
  styleUrls: ['./edit-contact.page.scss'],
})
export class EditContactPage implements OnInit {

  images = [];

  editContactForm: FormGroup = new FormGroup({});
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

  contact_id: any = 0;
  contact: any = {};
  mobileNumbers: any = [];
  contactNumber: any = [];

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
    private activatedRoute: ActivatedRoute
  ) {
    
    this.contact_id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getContactInfo(this.contact_id);
    this.loadStoredImages();
  

      this.contact_id = this.activatedRoute.snapshot.paramMap.get('id');;
      // this.contactDetailForUpdateForm();

    this.editContactForm = formBuilder.group({

      // basic
      name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+. ]*'), Validators.required])],
      email: [''],
      father_husband_name: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      dob: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.pattern('[a-zA-Z]*'), Validators.required])],
      marital_status_id: ['', Validators.compose([Validators.required])],
      occupation: ['', Validators.compose([Validators.required])],
      current_posting: ['', Validators.compose([Validators.required])],
      education: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+-. ]*'), Validators.required])],
      current_address: ['', Validators.compose([Validators.required])],
      native_village: ['', Validators.compose([Validators.pattern('[0-9a-zA-Z+ ]*'), Validators.required])],
      facebook_id: [''],
      mobiles: this.formBuilder.array([]),
      relatives: this.formBuilder.array([]),
      
    });
  }

  ngOnInit() {
    this.translate.setDefaultLang(this.global.language);
    this.plt.ready().then(() => {
      this.loadStoredImages();
      this.getAllStaticAndDynamicLists();
      // this.getCitiesStates();
    });
  }

  ionViewWillEnter() {
    // this.appendData();
  }

  getContactInfo(id) {

    this.global.showSortLoading();

    this.apis.getContactDetails(id).subscribe(
      (result: any) => {

        console.log(result);
        this.global.hideloading();
        
        if (result.status) {
          this.contact = result.data;
          this.mobileNumbers = this.contact.mobiles;
          console.log(this.mobileNumbers);

          this.defaultRelativesList();
          this.defaultMobilesList();

          console.log('this.contact:::', this.contact);
        } else {
          this.global.showMsg(result.message);
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
    });
  }

  accordionClicked(accordionID) {
    this.active = accordionID;
  }

  mobileForm(defaultValues): FormGroup {
    return this.formBuilder.group({
      mobile: [defaultValues, Validators.compose([Validators.minLength(10), Validators.maxLength(10),Validators.pattern('^(0|[1-9][0-9]*)$'), Validators.required])],
    });
  }

  addMoreMobilesNumbers() {
    console.log('addMoreMobilesNumbers called::::');
    this.mobiles = this.editContactForm.get('mobiles') as FormArray;
    let defaultValues = [];
    this.mobiles.push(this.mobileForm(defaultValues));
  }

  removeMobileNumber(index) {
    this.mobiles.removeAt(index);
  }

  defaultMobilesList() {
    console.log(this.mobiles);
    if (this.contact && this.contact.mobiles.length > 0) {
      this.mobiles = this.editContactForm.get('mobiles') as FormArray;
      console.log(this.mobiles);
      this.mobileNumbers.forEach((event) => {
        console.log(event);
        this.mobiles.push(this.mobileForm(event));
        console.log(this.mobileForm(event));
      });
      console.log(this.mobiles);
    }
  }

  relativeForm(defaultValues): FormGroup {
    return this.formBuilder.group({
      name: [defaultValues.name , Validators.compose([Validators.required])],
      relation: [defaultValues.relation, Validators.compose([Validators.required])],
    });
  }

  addMoreRelatives() {
    console.log('addMoreRelatives called::::');
    this.relatives = this.editContactForm.get('relatives') as FormArray;
    let defaultValues = { name: '', relation: '' }
    this.relatives.push(this.relativeForm(defaultValues));
  }

  removeRelative(index) {
    this.relatives.removeAt(index);
  }

  defaultRelativesList() {
    console.log(this.relatives);
    if (this.contact && this.contact.relatives.length > 0) {
      this.relatives = this.editContactForm.get('relatives') as FormArray;
      console.log(this.relatives);
      this.contact.relatives.forEach((event) => {
        this.relatives.push(this.relativeForm(event));
      });
    }
  }

  updateContact() {
    if (!this.editContactForm.valid) {
      return;
    }
    console.log(this.editContactForm);
    console.log('update contact form submitted');

    this.global.showloading();
    let user_id: string = this.global.currentUser.id;
    console.log(user_id);
    this.formPostInfo = {
      user_id: user_id,
      id: this.contact.id,
      name: this.editContactForm.value.name,
      email: this.editContactForm.value.email,
      father_husband_name: this.editContactForm.value.father_husband_name,
      dob: this.editContactForm.value.dob,
      gender: this.editContactForm.value.gender,
      marital_status_id: this.editContactForm.value.marital_status_id,
      occupation: this.editContactForm.value.occupation,
      current_posting: this.editContactForm.value.current_posting,
      education: this.editContactForm.value.education,
      current_address: this.editContactForm.value.current_address,
      native_village: this.editContactForm.value.native_village,
      facebook_id: this.editContactForm.value.facebook_id,
    };
    
    this.editContactForm.value.mobiles.forEach(event => {
      this.array.push(event.mobile);
    })
    console.log(this.array);
    this.formPostInfo.relatives = this.editContactForm.value.relatives;
    this.formPostInfo.mobiles = this.array;
    console.log('Final Form Data::::::::', this.formPostInfo);
    
    this.apis.updateContact(this.formPostInfo).subscribe((result: any) => {

        console.log(result);
        this.global.hideloading();

        if (result.status) {
          this.global.showMsg(result.message);

          this.navCtrl.navigateRoot('/contacts');
        } else {
          this.global.showError(result.message);
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });

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
    console.log('updateStoredImages called::::::');
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

      this.startUpload(newEntry);
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
      formData.append('user_id', this.global.currentUser.id);
      formData.append('id', this.contact.id);

      console.log('Final Form Data::::::::', formData);


      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    const loading = await this.loadingController.create({
      message: 'Uploading image...',
    });

    await loading.present();

    this.apis.updateContactImage(formData).subscribe((result: any) => {

        console.log(result);
        this.global.hideloading();

        if (result.status) {
          this.storage.remove(STORAGE_KEY);
          this.global.showMsg(result.message);
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

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

}
