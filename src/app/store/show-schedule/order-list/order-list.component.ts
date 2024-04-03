import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { CheckTool } from '../../../_factory/check-tool';
import { Calendar } from '../../../_factory/calendar';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { Firehttp } from '../../../_service/firehttp';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  providers:[OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar, CheckTool, ]
})
export class OrderListComponent implements OnInit {
  title = '客戶預約時間表顯示';
  db='store-order';
  db_during='during';
 
  @Input() day_list =[];
  @Input() searchObj={year:0, month:0, search_y_m:''}
  @Input() searchItem:any ={ 
    key:0, 
    value:{ 
      add_order_obj:{}, edit_obj:{}, ori_edit_obj:{},info_obj:{} 
    } 
  };
  store_order_list=[];
  colorObj ={ on_color:'blue' }
  during_list=[];
  uid = JSON.parse(localStorage.userInfo).uid;
  user_name= JSON.parse(localStorage.userInfo).displayName;
  init_socket=0;

  socketOrderUrl:string ="";
  socketCancelUrl:string ="";
  socketCheckPayUrl:string = '';

  @Output() voted = new EventEmitter<boolean>();

  goVote(obj) {
    this.voted.emit(obj);
  }

  constructor(
    private firestore:AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private checkTool:CheckTool,
    private calendar:Calendar,
    private http:Firehttp,
    private firedatabase:AngularFireDatabase,
  ) { }

  ngOnInit(): void {
    //this.getOrderList();
    //this.getDuringPrice();
    
  }

  ngOnChanges(changes){
    
    
    if(changes.day_list!=null && changes.day_list.currentValue !=null && changes.day_list.currentValue.length>0){
      //this.socketOrderUrl ='order/'+ this.uid+'/';
      this.socketCancelUrl= 'cancel/';
      this.socketCheckPayUrl= 'checkpay/';
      
      this.getOrderList();
      this.getDuringPrice();
    }
  }

  //==================  所有客戶預約的時間  ============================================
  getOrderList(){
    let app =this;
    let order_ym = this.getOrderYMStr();
    let params={
      ym:order_ym,
      store_uid:this.uid,
    }
    let obj={ref:null}; 
    obj.ref = this.firestore.collection(this.db).ref
    .where('store_uid','==',this.uid)
    .where('order_ym','==',params.ym)
    .where('cancel','==', 0)

    this.http.getByUid(obj, {
      success:function(data){
        app.store_order_list = data; 
        app.addOrderListToDayList(app.store_order_list);
      }
    });
  }

  //取得時段的價格
  getDuringPrice(){
    let app =this;
    let obj={ db:this.db_during, uid:this.uid }
    this.http.getByUid(obj, {
      success:function(data){
        app.during_list = data;
      },
    })
  }

  //添加客戶預約時間表至日物件裡
  addOrderListToDayList(c_list){
      this.day_list.forEach(function(val, key){
        val.forEach(function(mval, mkey){
          mval.order_list = [];
          c_list.forEach(function(cval, ckey){
            let c_month = cval.order_date;//.split("-")[2];
            c_month = parseInt(c_month);
        
            if(mval.day == c_month){
              mval.order_list.push(cval);
            }
          })
          
        });
      })
      console.log("添加客戶預約時間表",this.day_list);
  }

  addZero(item){
    let mitem =item.value.add_order_obj;
    if(mitem.s_hour<10 && mitem.s_hour.length<2 ){
      mitem.s_hour = '0'+ mitem.s_hour;
    } 
    if(mitem.s_min<10 && mitem.s_min.length<2){
      mitem.s_min = '0'+ mitem.s_min;
    } 
    if(mitem.e_hour<10 && mitem.e_hour.length<2){
      mitem.e_hour = '0'+ mitem.e_hour;
    } 
    if(mitem.e_min<10 && mitem.e_min.length<2){
      mitem.e_min = '0'+ mitem.e_min;
    } 
  }

  checkAddOrder(item){
    let app = this;
    this.addZero(item);
    //確認時間是否為空與是否重疊到別人的預約
    let isok= this.checkTool.checkTime(item.value.add_order_obj, item.value.order_list);
    
    //確認預約的時間是否在區間內
    let isok2= this.checkTool.checkTimeExist(item.value.add_order_obj, item.value.s_list);
    console.log(isok, isok2)
    if(!isok){
      return;
    }
    if(!isok2){
      this.ogcatDialog.confirm("您要預約的時間不在您設定的預約時段裡，確定要預約?",{
        success:function(data){
          app.addOrder(item);
        },
        cancel:function(data){
        }
      });
      return;
    }
    this.addOrder(item);
  }

  getOrderYMStr(){
    let mon = (this.searchObj.month<10)?"0"+this.searchObj.month : this.searchObj.month;
    let order_ym =this.searchObj.year.toString() + mon;
    return order_ym;
  }

  addOrder(sItem){
      let mObj=sItem.value.add_order_obj;
      if(mObj.is_pay==null){
        mObj.is_pay =0;
      }
      let order_ym = this.getOrderYMStr();
      let aobj={
        store_uid:this.uid,
        order_uid:this.uid,
        order_name:this.user_name,
        order_date: sItem.value.day,
        order_ym:order_ym,
        week: parseInt(sItem.key),
        start: mObj.start,
        end: mObj.end,
        during:mObj.during,
        price:mObj.price,
        is_pay:mObj.is_pay,
        updated_uid:'',
        updated_name:'',
        cancel:0
      }
      console.log(aobj)
      this.isAddObjIsset(sItem, aobj);
     // this.create(sItem,aobj)
  }

  isAddObjIsset(sItem, aobj){
    let obj={ ref:null, show:false }
    let app =this;
    obj.ref = this.firestore.collection(this.db).ref
    .where('uid','==', this.uid)
    .where('start','==', aobj.start)
    .where('end','==', aobj.end)
    .where('cancel','==', 0); 
    this.http.getByUid(obj,{
      success: function(data){
         if(data.length > 0){
          app.ogcatDialog.alert("抱歉，此時段已被預約，請另選時段");
          app.getOrderList();
         }else{
          app.create(sItem,aobj);
         }
      }
    })
  }

  create(sItem, aobj){
    let app =this;
    this.http.create(this.db, aobj, {
      success: function(data){
        sItem.value.is_add_order=false;
        aobj["id"] = data.id;
        sItem.value.order_list.push(aobj); //1.append item.value.add_obj to item.value.s_list
        app.reSortWeek(sItem.value.order_list) //2.sort item.value.s_list
        sItem.value.is_add = false; //3. change is_add status
        sItem.value.add_order_obj={};
      }
    })
  }

  goDeleteOrderItem(sorder, sItem){
      let app = this;
   
      this.ogcatDialog.confirm("刪除後無法復原，您確定要刪除此項目?",{
        success:function(data){
          app.deleteOrderItem(sorder, sItem);
        },
        cancel:function(data){
        }
      });
      
  }

  deleteOrderItem(sorder, sItem){
    let app = this;
    let delObj={
      cancel:1,
      updated_uid: this.uid,
      updated_name: this.user_name,
    }
    this.http.update(this.db, sorder.id, delObj, {
      success: function(data){
        app.ogcatTool.deleteArrayByID(sItem.value.order_list, sorder.id, "id");
        app.socketAddCancel(sorder.id, sorder.order_uid);
      }
    });
   
  }


  showOrderEdit(sorder, searchItem){
    searchItem.value.order_list.forEach(function(val, key){
      val.is_item_edit = false;
    });
    sorder.is_item_edit=true;
    sorder.s_hour = sorder.start.split(":")[0];
    sorder.s_min = sorder.start.split(":")[1];
    sorder.e_hour = sorder.end.split(":")[0];
    sorder.e_min = sorder.end.split(":")[1];
    searchItem.value.ori_edit_obj = sorder;
    searchItem.value.edit_obj = JSON.parse(JSON.stringify(sorder));
    searchItem.value.is_edit = true;
  }

  checkEditOrder(searchItem){
    this.editOrder(searchItem);
  }

  editOrder(searchItem){

    let app =this;
    let eObj =searchItem.value.edit_obj;
    eObj.start= eObj.s_hour + ':' + eObj.s_min;
    eObj.end= eObj.e_hour + ':' + eObj.e_min;
    let params = this.getUpdateObj(eObj);

    this.http.update(this.db, eObj.id, params, {
      success:function(data){
        searchItem.value.is_edit = false;
        let oObj = searchItem.value.ori_edit_obj;
        oObj.is_item_edit = false;
        oObj.customer_name = eObj.customer_name;
        oObj.during = eObj.during;
        oObj.price = eObj.price;
        oObj.is_pay = eObj.is_pay;
        oObj.start = eObj.s_hour + ':' + eObj.s_min;
        oObj.end = eObj.e_hour + ':' + eObj.e_min;
        //發送 ws
        if(eObj.is_pay == 1){
          app.sockeCheckPay(app.searchItem);
          app.infoWallAddOrderAct( app.searchItem.id, 'CP');
        }
        //app.goVote(searchItem); app.chRef.detectChanges();
      }
    })
  }

  getUpdateObj(eObj){
    return {
      price:eObj.price,
      start:eObj.start,
      end:eObj.end,
      during:eObj.during,
      is_pay:eObj.is_pay,
      updated_uid: this.uid,
      updated_name: this.user_name,
    }
  }

  //取消客戶預約的修改
  cancelOederEdit(searchItem){
    searchItem.value.is_edit=false;
    searchItem.value.ori_edit_obj.is_item_edit=false;
  }

  showOrderInfo(sorder, searchItem){
    searchItem.value.info_obj = sorder;
    searchItem.value.is_info=true;
  }
 
//================== 訊息牆相關  ============================================
 /**
  * 
  * @param order_id 
  * @param act E/P/C  E:訂單 P:付款 CP:確認付款 CU:客戶取消訂單 CS:商店取消訂單
  */ 
 infoWallAddOrderAct(order_id:string, act){
  let obj ={
    uid:this.searchItem.order_uid,
    ty:act,
    des:order_id,
    r:0
  };
  this.http.create(environment.db.info_wall , obj, {
    success:function(data){
      
    }
  })
}


//==================  websoket 相關  ============================================
/**
 socketAddOrder(order_id:string){
  this.firedatabase.database.ref(this.socketOrderUrl + order_id).set({
     t: 0,//new Date().getTime()
  });
}
 */

socketAddCancel(order_id:string, order_uid:string){
  this.firedatabase.database.ref(this.socketCancelUrl +order_uid+'/'+ order_id).set({
    t: 0,
 });
}

sockeCheckPay(searchItem){
  this.firedatabase.database.ref(this.socketCheckPayUrl+searchItem.order_uid +'/'+ searchItem.id ).set({
    t: 0,
  });
}

//==================  其他  ============================================

  //陣列排序
  reSortWeek(list){
    list = list.sort(function (a, b) { 
      return a.start > b.start ? 1 : -1;//1後面 -1前面
    });
  }

  calculateMinute(){
    let obj= this.searchItem.value.add_order_obj;
    if(obj.s_hour=='' || obj.s_min==''){
      return;
    }

   if(isNaN(obj.s_hour) || isNaN(obj.s_min)){
      this.ogcatTool.showErrorMessage("預約時間只能輸入數字!!");
      return;
   }
    //let isok = this.checkTool.checkTimeEmpty(obj);
    let isok = this.checkDuring(obj);  

    if(!isok){
      return;
    }
    //開始計算時間
    let endTime = this.calendar.addMinutes(obj);
    //console.log(endTime)
    let hours = endTime.getHours();
    let minutes = endTime.getMinutes();
    let price = this.pickPriceByDuring(obj);
    let h,m;
    h = (hours<10)? "0"+hours : hours;
    m = (minutes<10)? "0"+minutes : minutes;; 
    
    obj.e_hour =h;
    obj.e_min =m;
    obj.price = price;
    //console.log(this.searchItem.value)
  }

  pickPriceByDuring(obj){
    let price;
    this.during_list.forEach(function(val){
      if(obj.during == val.during){
        price = val.price;
      }
    });
    return price;
  }

  checkDuring(obj){
    if(obj.during ==null || obj.during ==''){
      return;
    }
    if(isNaN(obj.during)){
      this.ogcatTool.showErrorMessage("分鐘數必須是數字!!");
      return false;
    }
    return true;
  }


}
