import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';

import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { environment } from '../../../environments/environment';
import { map, finalize } from "rxjs/operators";
import { Observable } from "rxjs";
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Socket } from '../../_factory/socket/socket';


@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss'],
  providers:[OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar, Socket ]
})
export class CustomerOrderComponent implements OnInit {


 // db='store-order';
  
  uid:string='';
  user_name:string='';
   //儲存目前所點選那筆訂單的詳細資料
  searchItem={id:'', order_name:'', order_ym:'', order_date:'',during: '', end: '', is_pay: null,  created:'', updated:'',cancel:0, cancel_uid:'',cancel_remark:'',
              order_uid: '', pay_day: '', pay_number: '', price: '', start: '', store_id: '', store_uid: '',week:null, copy:{cancel:0},
            };
  list=[];
  pageObj={
    all:false,
    page_count:1000,//每頁顯示幾筆
    next:{},
    prev:{}
  }

  sortObj ={
    order_date:'desc'
  }

  searchObj={year:0, month:0, search_y_m:new Date() }
  locale;

  cusForm = new FormGroup({
    search_y_m: new FormControl(''),
    status:new FormControl(''),
  });

  params;

  socketObj={
    socketCancelUrl:'', 
    socketCheckPayUrl:'', 
  }
 

  constructor(
   // private elementRef:ElementRef,
   // private storage: AngularFireStorage, 
    private firestore: AngularFirestore,
    private firedatabase:AngularFireDatabase,
   // private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private route: ActivatedRoute,
    private router: Router,
    private socket:Socket
  ) { 
    let  userInfo = this.tool1.getSessionUserInfo()
    this.uid =userInfo.uid;
    this.user_name= userInfo.displayName;
  }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.getList();
    this.route.params.subscribe(params => {
      this.params = params;
    });
    this.router.events.subscribe(params => {
      console.log(params instanceof NavigationEnd) 
      if(params instanceof NavigationEnd){
        if(this.list.length>0){
          this.setParamsClass();
        }
      }
    });
  }

  /**
   * ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('.order-list').addEventListener('scroll', this.onScroll.bind(this));
  }
  
  onScroll(e){
    let ubottom=e.currentTarget.scrollHeight-e.currentTarget.scrollTop;
    ubottom = Math.floor(ubottom);
    let isBottom = ubottom === e.currentTarget.clientHeight;
  //  console.log(isBottom);
    if(isBottom){
      this.next();
    }
  }
   */
 
 
  //=============== 資料庫-取得資料 ====================================
  getList(){
    let obj= this.getReadObj();
    let selectedlef = this.getRef(obj); 
    let ref=  selectedlef.limit(obj.limit);
    obj.ref =ref;
    this.accesssAPI(obj);
  }

  getRef(obj){
    let status = this.cusForm.value.status;
    let ym = this.cusForm.controls.search_y_m.value;
    if(ym!=''){
      ym = this.calendar.getStrYMnoDashbyObj(this.cusForm.controls.search_y_m.value);
    }


    switch(status){
      case(""):
        if(ym == ''){
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).where('order_ym','==', ym).orderBy('created', 'desc');
        }
       
      case("0"): case("1"):
        let m_status = parseInt(status);
        if(ym == ''){
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).where('cancel','==', m_status).orderBy('created', 'desc');
        }else{
          return this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).where('cancel','==', m_status).where('order_ym','==', ym).orderBy('created', 'desc');
        }
     }
  }


  //=============== 資料庫-上下頁筆數 ====================================
  prev(){
    let obj= this.getReadObj();
    let ref=  this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('created', 'desc').endBefore(this.pageObj.prev).limitToLast(obj.limit);
    obj.ref =ref;
    this.accesssAPI(obj);
  }


  next(){
    if(this.pageObj.all){
      return;
    }
    let obj= this.getReadObj();
    let selectedlef = this.getRef(obj); 
   // let ref= this.firestore.collection(obj.db).ref.where('store_uid','==', obj.uid).orderBy('created', 'desc').startAfter(this.pageObj.next).limit(obj.limit);
   let ref=  selectedlef.startAfter(this.pageObj.next).limit(obj.limit); 
    obj.ref =ref;
    this.accesssAPI(obj,'next');
  }

  accesssAPI(obj, act?){
    let app =this;
    this.http.getByUid(obj, {
      success:function(data, mpageObj){
        if(data.length==0){
          app.pageObj.all = true; 
          app.list = data;
        }else{
          if(app.list.length===0 || act==null){
            app.list = data;
          }else{
            app.list = app.list.concat(data);
          }
          console.log(data)
          app.setPageObj(mpageObj);
          app.setParamsClass();
        }
      },
      error:function(error){ }
    })
  }

  getReadObj(){
    let obj={ db: environment.db.store_order , uid:this.uid, limit:this.pageObj.page_count, ref:null }
    return obj;
  }

  setPageObj(mpageObj){
    this.pageObj.prev = mpageObj.prev;
    this.pageObj.next = mpageObj.next;
  }

  setParamsClass(){
    let app =this;
    if(app.params==null || app.params.id==null || app.params.id==''){
      return;
    }
    this.list.forEach(function(val){
      if(val.id === app.params.id){
        val.isChoose=1;
      }else{
        val.isChoose=0;
      }
    });
  }
  //================= 其他- html ==========================================
  showModal(item){
    this.searchItem = item;
    $('#orderInfoModal').modal("show");
  }

  goSearchByMnoth(){
    this.getList();
  }
  
  sort(item_name, rule){
    this.sortObj[item_name] = rule;
    
    if(item_name == 'order_date'){
      if(rule == 'asc'){
        this.sortOrderDateAsc(this.list, item_name);
      }else if(rule == 'desc'){
        this.sortOrderDateDesc(this.list, item_name)
      }
    }else{
      if(rule == 'asc'){
        this.sortAsc(this.list, item_name);
      }else if(rule == 'desc'){
        this.sortDesc(this.list, item_name)
      }
    }
  }

  goUpdatePay(){
    let app =this;
    this.ogcatDialog.confirm("只能更新一次，確定要確認已付款?",{
     success:function(){
        app.updatePay();
     }
   })
  }

  
  updatePay(){
    let updateObj={
      is_pay:1,
    }
    let app =this;
    this.http.update(environment.db.store_order, this.searchItem.id ,updateObj, {
      success:function(data){
        app.searchItem.is_pay =1;
        //發送 ws
        app.infoWallAddOrderAct( app.searchItem.id, 'CP');
      }
    });
  }

  goDeleteOrderItem(){
    let app = this;
    let msg = `取消訂單即無法復原，您確定要取消此訂單? <span>請在以下輸入取消原因 (非必填)</span>`;
    let mobj={
      title:msg,
    }
    this.ogcatDialog.prompt(mobj,function(data){
      app.searchItem.cancel_remark = data;
      app.deleteOrderItem();
    });   
  }

  deleteOrderItem(){
    let app = this;
    let delObj={
      cancel:1,
      cancel_uid:this.uid,
      cancel_remark:this.searchItem.cancel_remark,
      updated_uid: this.uid,
      updated_name: this.user_name,
    }
    this.http.update(environment.db.store_order, this.searchItem.id, delObj, {
      success: function(data){
        app.searchItem.copy.cancel=1;
        app.searchItem.cancel=1;
        app.searchItem.cancel_uid = app.uid;
        app.infoWallAddOrderAct( app.searchItem.id, 'CS');
      }
    });
  
  }
 //================== 訊息牆相關  ============================================
 /**
  * 
  * @param order_id 
  * @param act E/P/C  E:訂單 P:付款 CP:確認付款 CU:客戶取消訂單 CS:商店取消訂單
  */ 
 infoWallAddOrderAct(order_id:string, act){
   let app =this;
  let obj ={
    uid:this.searchItem.order_uid,
    ty:act,
    des:order_id,
    r:0
  };
  
  this.http.create(environment.db.info_wall , obj, {
    success:function(data){
      obj['info_wall_id'] = data.id;
      obj['order_id'] = obj.des;
      app.socketObj.socketCancelUrl = environment.socketUrl.cancel_s + app.searchItem.order_uid+'/';
      app.socketObj.socketCheckPayUrl = environment.socketUrl.check_pay+ app.searchItem.order_uid+'/';
      
      app.socket.chooseSocket(obj, app.socketObj);
     }
  })
}

  //==================  websoket 相關  ============================================

  //---------------- 其他 private ----------------------
  private sortOrderDateAsc(list, field){
    list = list.sort(function (a, b) { 
      if(a[field] > b[field]){
        return 1; 
      }else if(a[field] == b[field]){
        return a.start > b.start ? 1:-1;//1後面 -1前面
      }else{
        return -1;
      }
    });
  }

  private sortOrderDateDesc(list, field){
    list = list.sort(function (a, b) { 
      if(a[field] > b[field]){
        return -1; 
      }else if(a[field] == b[field]){
        return a.start > b.start ? 1: -1;//1後面 -1前面
      }else{
        return 1;
      }
    });
  }

  private sortAsc(list, field){
    list = list.sort(function (a, b) { 
      return a[field] > b[field] ? 1 : -1;//1後面 -1前面
    });
  }

  private sortDesc(list, field){
    list = list.sort(function (a, b) { 
      return a[field] > b[field] ? -1 : 1;//1後面 -1前面
    });
  }


}






/*
 goDeleteOrderItem(){
    let app = this;
    this.ogcatDialog.confirm("刪除後無法復原，您確定要刪除此項目?",{
      success:function(data){
        app.deleteOrderItem();
      },
      cancel:function(data){
      }
    });
  }

*/