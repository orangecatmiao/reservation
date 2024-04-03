import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
//import { Msub1 } from '../../_data-services/msub1'

@Injectable()

export class Tool1 {
     constructor(
      private auth:AngularFireAuth, 
     ){}

    getSessionUserInfo(){
        if(localStorage.userInfo !=null){
          return JSON.parse(localStorage.userInfo);
        }
        return '';
    }
  
    getCurrentUser(){
      let app =this;
      this.auth.onAuthStateChanged(function(user) {
        if (user) {
          debugger
       
        } else {
          // No user is signed in.
        }
      });
    }

}
