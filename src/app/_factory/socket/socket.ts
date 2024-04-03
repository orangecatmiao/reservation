import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()

export class Socket {
     constructor(
        private firedatabase:AngularFireDatabase,
     ){}
     
     chooseSocket(infowallobj, sokct){
        switch(infowallobj.ty){
          case('E')://E:訂單
            infowallobj.soketurl=sokct.socketOrderUrl;
          break;
    
          case('P')://P:付款
            infowallobj.soketurl=sokct.socketPayUrl;
          break;
    
          case('CU')://CU:客戶取消訂單
            infowallobj.soketurl=sokct.socketCancelUrl;
          break;

          case('CS')://CS:商店取消訂單
            infowallobj.soketurl=sokct.socketCancelUrl;
          break;
        
          case('PE')://PE:已付款訂單
            infowallobj.soketurl=sokct.socketOrderPayUrl;
          break;

          case('CP')://CP:商店確認客戶已付款
            infowallobj.soketurl=sokct.socketCheckPayUrl;
          break;
    
        }
        this.socketAdd(infowallobj);
      }

      socketAdd(infowallobj){
        this.firedatabase.database.ref(infowallobj.soketurl + infowallobj.des).set({
          t: infowallobj.info_wall_id,//infowall 的 id
        });
      }

}


