import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable, from, of, forkJoin } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

import { File, FileEntry } from '@ionic-native/file/ngx';

/*
  Generated class for the SettingsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
  url: string,
  type: string,
  data: any,
  time: number,
  id: string
} 

@Injectable()
export class SettingsProvider {
  filePath: string;
  fileName: string;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private toastController: ToastController,
    private file: File,
    ) {
  }

  checkForEvents(): Observable<any> {
    return from(this.storage.get(STORAGE_REQ_KEY)).pipe(
      switchMap(storedOperations => {
        let storedObj = JSON.parse(storedOperations);
        console.log(storedObj);
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
            finalize(() => {
              let toast = this.toastController.create({
                message: `Local data succesfully synced to API!`,
                duration: 3000,
                position: 'bottom'
              });
              toast.then(toast => toast.present());
 
              this.storage.remove(STORAGE_REQ_KEY);
            })
          );
        } else {
          console.log('no local events to sync');
          return of(false);
        }
      })
    )
  }
 
  storeRequest(url, type, data){
    let toast = this.toastController.create({
      message: `Your data is stored locally because you seem to be offline.`,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());

    let formData = {
      user_id: data.get('user_id'),
      candidate_name: data.get('candidate_name'),
      candidate_email: data.get('candidate_email'),
      candidate_mobile: data.get('candidate_mobile'),
      recording_datetime: data.get('recording_datetime'),
      recording_duration: data.get('recording_duration'),
      lat: data.get('lat'),
      lon: data.get('lon'),
      address: data.get('address'),
      filename: data.get('filename'),
      filePath: data.get('filePath')
    }

    // console.log(formData.file_name);


    // let formData: FormData = new FormData();
    // formData.append('user_id' ,data.get('user_id'));
    // formData.append('candidate_name' ,data.get('candidate_name'));
    // formData.append('candidate_email' ,data.get('candidate_email'));
    // formData.append('candidate_mobile' ,data.get('candidate_mobile'));
    // formData.append('recording_datetime' ,data.get('recording_datetime'));
    // formData.append('recording_duration' ,data.get('recording_duration'));
    // console.log(data.getAll('user_id'));
    let action: StoredRequest = {
      url: url,
      type: type,
      data: formData,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    console.log(action);
    console.log(action.data);
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    // console.log(JSON.parse(localStorage.getItem(STORAGE_REQ_KEY)));
    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);
      // console.log(storedOperations);
      console.log(storedObj);
      this.storage.remove(STORAGE_REQ_KEY);
      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }
      console.log(storedObj);
      // Save old & new local transactions back to Storage
      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }
 
  sendRequests(operations: StoredRequest[]) {
    let obs = [];

    for (let op of operations) {
      let formData: FormData = new FormData();
        // console.log(fileInfo);
        // this.fileName = fileInfo.fileName;
        // this.filePath = fileInfo.filePath;
        // console.log(this.fileName);
        // console.log(this.filePath);
        // console.log(op.data.user_id);
        formData.append('user_id' , op.data.user_id);
        formData.append('candidate_name' , op.data.candidate_name);
        formData.append('candidate_email' , op.data.candidate_email);
        formData.append('candidate_mobile' , op.data.candidate_mobile);
        formData.append('recording_datetime' , op.data.recording_datetime);
        formData.append('recording_duration' , op.data.recording_duration);
        formData.append('lat' , op.data.lat);
        formData.append('lon' , op.data.lon);
        formData.append('address' , op.data.address);
        // console.log(op.data.filename);
        const filename1 = op.data.filename;
        // console.log(op.data.filePath);
        this.file.readAsArrayBuffer(op.data.filePath, filename1).then((data) => {
          const audioBlob = new Blob([data], { type: '.mp3' });
          formData.append('file_name', audioBlob, filename1);
          console.log(audioBlob);
          console.log(op.data.filename);
          // console.log(formData.get('file_name'));
          // let file = formData.get('file_name');
          // console.log(file);
          op.data = formData;
          console.log(op.data.get('file_name'));
          // console.log('Make one request: ', op);
          console.log(op.data);
          let oneObs = this.http.post(op.url, op.data).subscribe(resData => {
            console.log(resData);
            console.log(op.data.get('file_name'));
            console.log('ggggggggggggggggggg');
          });
          // console.log(oneObs);
          obs.push(oneObs);
        });
    //  console.log(':::::::::efhref');
    }
 
    // Send out all local events and return once they are finished
    return forkJoin(obs);
  }

}
