import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar } from '../../../../../projects/ogcat-tool-package/src/public-api';
import { CheckTool } from '../../../_factory/check-tool';
import { Calendar } from '../../../_factory/calendar';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { Firehttp } from '../../../_service/firehttp';
import { environment } from 'src/environments/environment';
import { Tool1 } from '../../../_factory/tool1/tool1';
import { Msub1 } from '../../../_data-services/msub1';
import { Subscription } from 'rxjs';
import { Socket } from '../../../_factory/socket/socket';


@Component({
  selector: 'app-order-list-show',
  templateUrl: './order-list-show.component.html',
  styleUrls: ['./order-list-show.component.scss'],
  providers:[OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar, CheckTool, Tool1, Socket]
})
export class OrderListShowComponent implements OnInit {

  title = '客戶預約時間表顯示';
  db='store-order';
  db_during='during';
  init_date_pick =0;
  @Input() storeInfo={ id:'', uid:'', store_name:'' };
  @Input() day_list =[];
  @Input() searchObj={year:0, month:0, search_y_m:''}
  @Input() searchItem:any ={ 
    key:0, 
    value:{ 
      add_order_obj:{
        id:'', during: '', end: '', is_pay: 0, order_date: '', order_name: '', order_uid: '',
        order_ym: '', pay_day: '', pay_number: '', price: '', start: '', store_uid: '', week: 0,
        duringObj:null
      },
      info_obj:{}, edit_obj:{is_pay:0}, ori_edit_obj:{} 
    } 
  };

  duringObj:{ }
  
  store_order_list=[];
  colorObj ={ on_color:'blue' }
  during_list=[];
  uid ;

  user_name;
  locale;
  init_socket=0;
  init_socket2=0;
  init_socket3=0;

  socketObj={
    socketOrderUrl :"",
    socketOrderPayUrl:"",
    socketPayUrl:"",
    socketCancelUrl:"",
    socketDuringUrl:"",
  }
  
  
  subscription1: Subscription;
  subscription2: Subscription;

  @Output() voted = new EventEmitter<boolean>();

  goVote(obj) {
    this.voted.emit(obj);
  }

  constructor(
    private firestore:AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private checkTool:CheckTool,
    private calendar:Calendar,
    private http:Firehttp,
    private ref: ChangeDetectorRef,
    private tool1:Tool1,
    private msub1:Msub1,
    private socket:Socket
  ) { 
    this.locale = this.calendar.localize();
  }
  
  ngOnInit(): void {
    this.initUserInfo();


  }
  initUserInfo(){
    let userInfo =this.tool1.getSessionUserInfo();
    this.uid = userInfo.uid;
    this.user_name = userInfo.displayName;
  }

  ngOnChanges(changes){
    
    if(changes.storeInfo == null || changes.storeInfo.currentValue.uid == ''){
      return;
    }
    if(changes.storeInfo.currentValue.uid !='' && this.during_list.length==0){
      this.socketObj.socketOrderUrl = environment.socketUrl.order+ this.storeInfo.uid+'/'; 
      this.socketObj.socketOrderPayUrl = environment.socketUrl.order_pay + this.storeInfo.uid+'/';
      this.socketObj.socketPayUrl= environment.socketUrl.pay+ this.storeInfo.uid+'/';
      this.socketObj.socketCancelUrl= environment.socketUrl.cancel_u + this.storeInfo.uid+'/';
      this.socketObj.socketDuringUrl= environment.socketUrl.during + this.storeInfo.uid+'/';
      this.getOrderList();
      this.getDuringPrice();
      //this.listenOrder();//考慮連線數如果太多就取消
      //this.listenCancel();//考慮連線數如果太多就取消
      //this.listenDuring();//考慮連線數如果太多就取消
    }
  }

  ngAfterViewInit(){
   
  }
  //==================  取得資料庫資料  ============================================
  getOrderList(){
    let app =this;
    let order_ym = this.getOrderYMStr();
    let params={
      ym:order_ym,
      store_uid:this.storeInfo.uid,
    }
    
    let obj={ref:null, show:false};
    obj.ref = this.firestore.collection(this.db).ref
    .where('store_uid','==',params.store_uid)
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
    let obj={
      db:this.db_during,
      uid: this.storeInfo.uid
    }
    
    this.http.getByUid(obj, {
      success:function(data){
        app.during_list = data;
      },
    })
  }


  //==================  取得資料後的動作  ============================================
  //添加客戶預約時間表至日物件裡
  addOrderListToDayList(c_list){
      let app =this;
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
          app.reSortWeek(mval.order_list)//排序
        });
      })
      
      this.ref.detectChanges();
     // console.log("添加客戶預約時間表",this.day_list);
  }



 //==================  新增修改刪除  ============================================
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
    this.addZero(item);
    //確認時間是否為空與是否重疊到別人的預約
    let isok= this.checkTool.checkTime(item.value.add_order_obj, item.value.order_list);
    
    //確認預約的時間是否在區間內
    let isok2= this.checkTool.checkTimeExist(item.value.add_order_obj, item.value.s_list);
   // console.log(isok, isok2)
    if(!isok || !isok2){
      return;
    }
    this.addOrder(item);
  }

  getOrderYMStr(){
    let mon = (this.searchObj.month<10)?"0"+this.searchObj.month : this.searchObj.month;
    let order_ym =this.searchObj.year.toString() + mon;
    return order_ym;
  }


  checkPayDayNumber(mObj, edit?){
    let pay_day = (mObj.pay_day==null || mObj.pay_day=='')?0:1; //0:無值 1:有值
    let pay_number = (mObj.pay_number==null || mObj.pay_number=='')?0:1;
    let error=0;
    let msg;
    if(edit=='edit'){
      if(pay_day==0 || pay_number==0){
        msg= "[付款日期] 與 [帳號末4碼] 為必填";
        error++;
      } 
    }
    if((pay_day==1 && pay_number==0) || (pay_day==0 && pay_number==1)){
      msg= "[付款日期] 與 [帳號末4碼] 必須同時填或不填";
      error++;
    }
    if(error>0){
      return {
        msg:msg,
        result:false
      }//不給過
    }
    return {
      msg:msg,
      result:true
    }//給過
  }

  addOrder(sItem){
      let islogin = this.checkLogin();
      if(!islogin){
        return;
      }
      let mObj=sItem.value.add_order_obj;
      let pass = this.checkPayDayNumber(mObj);
      if( !pass.result ){
        this.ogcatTool.showErrorMessage(pass.msg);
        return;
      }

      if(mObj.is_pay==null){
        mObj.is_pay =0;
      }
      let ym = this.calendar.getStrYMDHMSbyObj(mObj.pay_day);//getStrYMDbyObj
      if(mObj.pay_number == null){
        mObj.pay_number = '';
      }
      let order_ym = this.getOrderYMStr();
      let aobj={
        store_uid:this.storeInfo.uid,
        store_id:this.storeInfo.id,
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
        pay_number:mObj.pay_number,
        pay_day: ym,
        updated_uid:'',
        updated_name:'',
        cancel:0
      }
      //console.log(aobj)
      this.isAddObjIsset(sItem, aobj);
      //this.create(sItem,aobj)
  }

  checkLogin(){
    this.initUserInfo();
    if(this.uid ==null || this.uid==''){
      $("#loginModal").modal("show");
      return false;
    }
    return true;
  }

  isAddObjIsset(sItem, aobj){
  
    let app =this;
 
    let obj={ref:null, show:false};
    obj.ref = this.firestore.collection(this.db).ref
    .where('uid','==', this.storeInfo.uid)
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
        aobj.copy = JSON.parse(JSON.stringify(aobj));
        sItem.value.order_list.push(aobj); //1.append item.value.add_obj to item.value.s_list
        app.reSortWeek(sItem.value.order_list) //2.sort item.value.s_list
        sItem.value.is_add = false; //3. change is_add status
        sItem.value.add_order_obj={};
        if(aobj.pay_day!=null && aobj.pay_day!='' && aobj.pay_number!=null && aobj.pay_number!=''  ){
         // app.socketAddOrderPay(aobj["id"]);
          app.infoWallAddOrderAct( aobj["id"], 'PE');
        }else{
        //  app.socketAddOrder(aobj["id"]);
          app.infoWallAddOrderAct( aobj["id"], 'E');
        }
      
      }
    })
  }

  goDeleteOrderItem(sorder, sItem){
      let app = this;
      let msg = `取消訂單即無法復原，您確定要取消此訂單? <span>請在以下輸入取消原因 (非必填)</span>`;
      let mobj={
        title:msg,
      }
      this.ogcatDialog.prompt(mobj,function(data){
        sorder.cancel_remark = data;
        app.deleteOrderItem(sorder, sItem);
      });   
  }

  deleteOrderItem(sorder, sItem){
    let app = this;
    let delObj={
      cancel:1,
      cancel_uid: this.uid,
      updated_uid: this.uid,
      updated_name: this.user_name,
    }
    this.http.update(this.db, sorder.id,delObj, {
      success: function(data){
        app.ogcatTool.deleteArrayByID(sItem.value.order_list, sorder.id, "id");
       // app.socketAddCancel(sorder.id);
        app.infoWallAddOrderAct( sorder.id, 'CU');
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
    let eObj =searchItem.value.edit_obj;
    let pass = this.checkPayDayNumber(eObj,'edit');
    if(!pass.result){
      this.ogcatTool.showErrorMessage(pass.msg);
      return;
    }
    this.editOrder(searchItem);
  }

  editOrder(searchItem){
    let app =this;
    let eObj =JSON.parse(JSON.stringify(searchItem.value.edit_obj));
    eObj.pay_day = this.calendar.getStrYMDHMSbyObj(searchItem.value.edit_obj.pay_day);
    let params = this.getUpdateObj(eObj);

    this.http.update(this.db, eObj.id, params, {
      success:function(data){
        searchItem.value.is_edit = false;
        let oObj = searchItem.value.ori_edit_obj;
        oObj.is_item_edit = false;
        oObj.pay_number =eObj.pay_number;
        oObj.pay_day = eObj.pay_day;
       // oObj.is_pay=1
        oObj.copy.is_pay=1;
        //app.socketAddPay(eObj["id"]);
        app.infoWallAddOrderAct( eObj["id"], 'P');
        //app.goVote(searchItem); //app.chRef.detectChanges();
      }
    })
  }

  getUpdateObj(eObj){
    return {
      pay_day:eObj.pay_day,
      pay_number:eObj.pay_number,
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
  * @param order_id 
  * @param act E/P/C/PE  E:訂單 P:付款 PE:已付款訂單 CU:客戶取消訂單 CS:商店取消訂單
  */ 
 infoWallAddOrderAct(order_id:string, act){
    let app =this;
    let obj ={
      uid:this.storeInfo.uid, //store_id:this.storeInfo.id,
      ty:act,
      des:order_id,
      r:0
    };
    this.http.create(environment.db.info_wall , obj, {
      success:function(data){
        obj['info_wall_id'] = data.id;
        obj['order_id'] = obj.des;
        
        app.socket.chooseSocket(obj, app.socketObj);
      }
    })
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
    if(obj.duringObj==null){
      return;
    }

    obj.during = obj.duringObj.during;
    if(obj.s_hour=='' || obj.s_min==''){
      return;
    }

    if(isNaN(obj.s_hour) || isNaN(obj.s_min)){
        this.ogcatTool.showErrorMessage("預約時間只能輸入數字!!");
        return;
    }
  
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

  }

  pickPriceByDuring(obj){
    let price;
    this.during_list.forEach(function(val){
      if(obj.duringObj.id == val.id){
        price = val.price;
      }
    });
    return price;
  }

  //依照預約分鐘數取得相對應的價格
  checkDuring(obj){
    obj.price='';
    if(obj.during ==null || obj.during ==''){
      return;
    }
  
    if(isNaN(obj.during)){
      this.ogcatTool.showErrorMessage("分鐘數必須是數字!!");
      return false;
    }
    return true;
  }

  showAddTable(){
    this.searchItem.value.is_add_order=true;
  }
  


}









//==================  websoket 相關  ============================================
 
 /*
  listenOrder(){
    let app =this;
    let root = this.firedatabase.database.ref(this.socketOrderUrl)
    root.on('value', function(snap){
      app.init_socket++;
      if(snap.val() != null){
         console.log("訂單資訊",Object.keys(snap.val()) )
         if(app.init_socket>1){
          app.getOrderList();
         }
      } 
    });
  }

  listenCancel(){
    let app =this;
    let root = this.firedatabase.database.ref(this.socketCancelUrl)
    root.on('value', function(snap){
      app.init_socket2++;
      if(snap.val() != null){
         console.log("訂單動作",Object.keys(snap.val()) )
         if(app.init_socket2>1){
            app.getOrderList();
         }
      } 
    });
  }

  listenDuring(){
    let app =this;
    let root = this.firedatabase.database.ref(this.socketDuringUrl)
    root.on('value', function(snap){
      app.init_socket3++;
      if(snap.val() != null){
         console.log("更新區間",Object.keys(snap.val()) )
         if(app.init_socket3>1){
            app.getDuringPrice();
         }
      } 
    });
  }
  
 */