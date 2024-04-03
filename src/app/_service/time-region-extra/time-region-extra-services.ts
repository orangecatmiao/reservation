import { Injectable } from '@angular/core';
import { OgcatTool } from '../../../../projects/ogcat-tool-package/src/public-api';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from "@angular/fire/storage";
@Injectable()

export class TimeRegionExtraServices {

    db ='time-region-extra';
    
    constructor(
        private ogcatTool:OgcatTool,
        private firestore: AngularFirestore,
        private storage: AngularFireStorage, 
        private firedatabase:AngularFireDatabase,
        //private auth:AngularFireAuth
    ){}
    
  /**
     * 
     * @param pointer 
     * @param db 
     * @param callback 
     */
    getByYM(obj, callback ){
        let uid = JSON.parse(localStorage.userInfo).uid
        let app= this;;
        app.ogcatTool.loadingMask(true);
        app.firestore.collection(this.db).ref.where('uid','==',uid).where('ym','==',obj.ym).get().then((querySnapshot) => {
            if(callback.success){
                let list=[];
                querySnapshot.forEach(function(doc:any) {
                    let obj = doc.data();
                    obj.id = doc.id;
                    obj.copy = JSON.parse(JSON.stringify(obj));
                    list.push(obj); // console.log(doc.id, " => ", doc.data());
                });
                callback.success(list);
                app.ogcatTool.showMessage("資料取得成功 !!");
            }
        }).catch(function(error) {
            app.ogcatTool.showErrorMessage("資料取得失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            app.ogcatTool.loadingMask(false);
        });
    }


    getByYM_customer(obj, callback ){
        let app =this;
        app.firestore.collection(this.db).ref.where('uid','==',obj.uid).where('ym','==',obj.ym).get().then((querySnapshot) => {
            if(callback.success){
                let list=[];
                querySnapshot.forEach(function(doc:any) {
                    let obj = doc.data();
                    obj.id = doc.id;
                    obj.copy = JSON.parse(JSON.stringify(obj));
                    list.push(obj); // console.log(doc.id, " => ", doc.data());
                });
                callback.success(list);
                app.ogcatTool.showMessage("資料取得成功 !!");
            }
        }).catch(function(error) {
            app.ogcatTool.showErrorMessage("資料取得失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            //pointer.ogcatTool.loadingMask(false);
        });
    }


}
