import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
//import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Calendar } from '../../_factory/calendar';
import { CheckTool } from '../../_factory/check-tool';
import { Firehttp } from '../../_service/firehttp';
import { TimeRegionExtraServices } from '../../_service/time-region-extra/time-region-extra-services';
import { Schedule } from '../../_factory/schedule/schedule';
import { Tool1 } from './../../_factory/tool1/tool1';
import { UserAction } from './../../_factory/user-action/user-action';
import { Msub1 } from '../../_data-services/msub1';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-schedule-show',
  templateUrl: './schedule-show.component.html',
  styleUrls: ['./schedule-show.component.scss'],
  providers:[OgcatTool, OgcatUser, OgcatCalendar, CheckTool, Calendar, Firehttp, TimeRegionExtraServices, Schedule, Tool1, UserAction]
})
export class ScheduleShowComponent implements OnInit {
  title = '前台-店家時間表顯示預約';
  params:any ={};
  store_uid:string='';
  
  db_store='store-info';
  db='time-region-extra';
  db_time_region ='time-region';
 
  storeInfo={ id:'', uid:'', store_name:'', description:'', img_token:'', month_set:false };
  extra_day_list=[];
  extra_add_list=[];
  extra_cut_list=[];
  day_list=[];
  month_set_list=[];

  record_list=[];
  setting_list=[];
  add_key =0;

  dateObj={year:0,month:0}
  searchObj={year:0, month:0, month_set:true, search_y_m:new Date() }
  searchItem:any ={ 
    key:0, 
    value:{ 
      add_obj:{}, 
      add_order_obj:{ during: '', end: '', is_pay: 0, order_date: '', order_name: '', order_uid: '',
      order_ym: '', pay_day: '', pay_number: '', price: '', start: '', store_uid: '', week: 0}
      ,info_obj:{}, edit_obj:{is_pay:0} 
    } 
  };
  init_week_time=false;
  get_extra_time=false;
  init_extra_time= false;
  colorObj ={ on_color:'blue' }
  mobileObj={showItem:{key:0, value:{add_obj:'', add_order_obj:'', day:null,s_list:[]}}}
  uid;



  is_firebase:number =0;
  subscription1: Subscription;
  current_order_id:string='';
  origin_order_record=[];
  locale;

  init_socket=0;
  init_socket2=0;



  socketTimeUrl:string ="";
  socketTimeExtraUrl:string ="";
  
  dataObj= {user_uid:'', store_id:'', store_name:'', id:'', is_favorite:false, store_info:null}

  constructor(
   // private firestore:AngularFirestore,
    private firedatabase:AngularFireDatabase,
    private ogcatTool:OgcatTool,
  //  private ogcatDialog:OgcatDialog,
    private calendar:Calendar,
   // private checkTool: CheckTool,
    private http:Firehttp,
    private timeRegionExtraServices:TimeRegionExtraServices,
    private Schedule: Schedule,
    private route:ActivatedRoute,
    private tool1:Tool1,
    private userAction:UserAction,
    private ref: ChangeDetectorRef,
    private msub1:Msub1
    ) { 
      this.uid = this.tool1.getSessionUserInfo().uid;
      this.route.params.subscribe(params => {
        this.params = params;
        if(params.id!=null && params.id!=""){
        
        }
      });
       /*
       this.subscription1 = this.msub1.getStoreInfo().subscribe(x => {
        if(x!=null){
          this.storeInfo = x; 
          this.getStoreInfoCallback() ;
        }else{
          this.storeInfo.id="no-store";
        } 
         });
       */
  }

  ngOnInit(): void {
    this.locale = this.calendar.localize();
    this.initDateObj();
    this.initDayArray();
    this.getStoreInfo();
  }

  ngAfterViewChecked(){
    $('body').popover({
      selector:'.moo',
      trigger: 'click',
      html:true,
      content: function() {
            return $("#popoverTemplete").html()
            }
    }) 
      
  }


  onVotedOrderList(event){

  }

  initDateObj(){
    let currentdate = new Date();
    let year =this.dateObj.year =this.searchObj.year = currentdate.getFullYear();
    let month =this.dateObj.month =this.searchObj.month =  currentdate.getMonth()+1;
  }


  //計算出當月日期，顯示星期
  initDayArray(){
    this.day_list = this.calendar.initCalendar(this.searchObj);
    console.log(this.searchObj.month+"月",this.day_list );
  }

 //===========================================================  取得資料庫資料 ===============================================================
 
    //取得商店相關資料
    getStoreInfo(){
      let app =this;
      let obj={
        db: this.db_store,
        id:this.params.id
      }
      this.http.getByID(obj, {
        success:function(data){ 
          app.storeInfo = data;
          app.store_uid = app.storeInfo.uid;
          
          app.getTimeList();
          app.getExtraTime();
          if(app.storeInfo.month_set){
            app.getMonthSet();
          }
          if(app.uid!=null && app.uid!=''){
            //console.log("取得最愛商店")
            app.getFavorite();
          }
          
          //app.socketTimeUrl = 'time/'+ app.storeInfo.uid+'/';
          //app.listenTime();
        }
      });
    }

    getMonthSet(){
      console.log("取得月份設定");
      let app = this;
      let obj={
        db:environment.db.month_set,
        uid:this.storeInfo.uid
      }
      
      this.http.getByUid(obj, {
        success:function(data){
          app.month_set_list = data;
        }
      });
    }
    
    //取得時間表設定
    getTimeList(){
      let app =this;
      let obj= {
        db:this.db_time_region,
        uid: this.storeInfo.uid,
        show:false
      };
      this.http.getByUid(obj, {
        success:function(data){
          app.setting_list = data;
          app.setSettingList();
        }
      });
    }

    //取得當月的時間表設定
    getExtraTime(){
      let app =this;
      //todo 還要在一個條件: 年/月
      let ym = this.getYMStr();
      let sObj={ uid:this.storeInfo.uid, ym: ym.year + ym.month, show:false}
      this.timeRegionExtraServices.getByYM_customer(sObj, {
        success:function(data){
          app.extra_day_list = data;
          app.get_extra_time = true;
          if(app.init_week_time == true){
            app.separateExtra();
            //app.setDayTimeList();
          }
        }
      });
    }

    getYMStr(){
      let year =  this.searchObj.year;
      let month =  this.searchObj.month;
      let mon ='';
      if(month<10){ mon = "0" + month; }
      else{ mon = "" + month;}
      return{
        year : year,
        month:mon 
      }
    }

 //===========================================================  陣列整理  ======================================================
   
    //1.#AAA 添加每日預設表的設定時間 s_list
    setSettingList(){
      this.Schedule.setSettingList(this.day_list, this.setting_list);

      //------------------------------------------------
      this.init_week_time = true;
      if(this.get_extra_time==true && this.init_extra_time!=true){
        this.separateExtra();
      }
      //-------------------------------------------------
      // console.log("lalala",this.day_list)
    }


    //2.將 this.extra_day_list 裡面的 +/- 分離
    separateExtra(){
      let app =this;
      this.extra_add_list =[];
      this.extra_cut_list=[];
      this.extra_day_list.forEach(function(val){
        if(val.tp=='+'){
          app.extra_add_list.push(val);
        }else if(val.tp=='-'){
          app.extra_cut_list.push(val);
        }
      });
      this.setDayTimeListCut();
    }

    //3. extra time 對照的刪除: (-) -- 個別日期的特定設定時間
    setDayTimeListCut(){
      let app =this;
      this.init_extra_time = true;
      this.extra_cut_list.forEach(function(list_val,daykey){
        app.day_list.forEach(function(val,key){
          val.forEach(function(mval, mkey){
            if(list_val.day == mval.day){
              mval.s_list.forEach(function(sval, skey){
                if(list_val.start === sval.start && list_val.end === sval.end){
                  app.ogcatTool.deleteArrayByID( mval.s_list, sval.id, 'id'); //刪除陣列
                  //sval.extra = true;
                  //sval.extra_del = true;
                  //sval.extra_id = list_val.id;
                }
              });//.end mval.s_list 
            }//.end if
          });//.end val
        });//.end day_list
      });//.end extra_cut_list
      this.setDayTimeList();
    }

    //4.extra time 對照添加: (+) -- 個別日期的特定設定時間
    setDayTimeList(){
      console.log("執行幾次");
      let app =this;
      this.init_extra_time = true;
      this.extra_add_list.forEach(function(list_val,daykey){
        app.day_list.forEach(function(val,key){
          val.forEach(function(mval, mkey){
            if(list_val.day == mval.day){
              list_val.extra = true;
              mval.s_list.push(list_val);
            }
          })
        });
      })
      this.sortTimeList();
    }

    //5.排序時間
    sortTimeList(){
      let app =this;
      this.day_list.forEach(function(week,key){
        week.forEach(function(slist,skey){
          slist.s_list =slist.s_list.sort(function (a, b) { 
            return a.start > b.start ? 1 : -1;//1後面 -1前面
          });
        });
      });
     
      app.ref.detectChanges();
    }

  //==================  其他  ============================================
 
    //陣列排序
    reSortWeek(list){
      list = list.sort(function (a, b) { 
        return a.start > b.start ? 1 : -1;//1後面 -1前面
      });
    }

    showOrderListModal(item){
      this.searchItem = item; // this.searchItem.value.add_obj.duringObj={price:0}; 
      $('#orderListModal').modal("show");
    }


    goSearchByMnoth(){
      this.setting_list =[];
      this.extra_day_list = [];
      this.get_extra_time = false;
      this.init_week_time = false;
      this.init_extra_time = false;         
    
      let s_date = this.searchObj.search_y_m;//$("#search_month").val();
      let s_year = s_date.getFullYear();
      let s_month= s_date.getMonth()+1;
      this.searchObj.year = s_year;
      this.searchObj.month = s_month;
    
      this.initDayArray();//this.getStoreInfo();
      this.getTimeList();
      this.getExtraTime();
      this.isMonthSet();
    }

    isMonthSet(){

      if(this.storeInfo.month_set==false){
        return;
      }
      let isok=0;
      let search_y_m = this.calendar.getStrYMbyObj(this.searchObj.search_y_m);
      this.month_set_list.forEach(function(val){
        if(val.ym == search_y_m){
          isok++;
        }
      }); 
      if(isok>0){
        this.searchObj.month_set=true;
      }else{
        this.searchObj.month_set=false;
      }

    }

    getFavorite(){
      this.dataObj ={
       user_uid : this.uid, 
       store_id: this.storeInfo.id, 
       store_name: this.storeInfo.store_name, 
       id:'', 
       is_favorite:false, 
       store_info:null
      }
     this.userAction. getFavorite(this.dataObj);
   }
   
   favorite(){
     this.userAction.favorite(this.dataObj);
   }
//==================  Web Socket 相關  ============================================
 


//==================  Mobile  ============================================
  mobile_showTime(item){
    this.mobileObj.showItem = item;
   
         
  }

  ngOnDestroy() {
   // this.subscription1.unsubscribe();
  
  }

}







    /*
  getStoreInfoCallback(){
      this.store_uid = this.storeInfo.uid;
      this.getTimeList();
      this.getExtraTime();
      if(this.storeInfo.month_set){
        this.getMonthSet();
      }
     
      //app.socketTimeUrl = 'time/'+ app.storeInfo.uid+'/';
      //app.listenTime();
    }



     listenTime(){
    let app =this;
    let root = this.firedatabase.database.ref(this.socketTimeUrl)
    root.on('value', function(snap){
      app.init_socket++;
      if(snap.val() != null){
        console.log("區間",Object.keys(snap.val()) )
        if(app.init_socket>1){
          
          app.get_extra_time = false;
          app.init_week_time =false;
          app.init_extra_time =false;
          app.initDayArray();
          app.getTimeList();
          app.getExtraTime();
        }
      } 
    });
  }
    
    */