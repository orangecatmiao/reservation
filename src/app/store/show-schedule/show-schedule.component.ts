import { Component, OnInit } from '@angular/core';
//import { AngularFirestore } from '@angular/fire/firestore';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Calendar } from '../../_factory/calendar';
import { CheckTool } from '../../_factory/check-tool';
import { Firehttp } from '../../_service/firehttp';
import { TimeRegionExtraServices } from '../../_service/time-region-extra/time-region-extra-services';

import { Schedule } from '../../_factory/schedule/schedule';
import { Tool1 } from '../../_factory/tool1/tool1';

@Component({
  selector: 'app-show-schedule',
  templateUrl: './show-schedule.component.html',
  styleUrls: ['./show-schedule.component.scss'],
  providers:[OgcatTool, OgcatUser, OgcatDialog, OgcatCalendar, CheckTool, Calendar, Firehttp, TimeRegionExtraServices, Schedule, Tool1]
})
export class ShowScheduleComponent implements OnInit {
  title = '店家時間表顯示';
  db='time-region-extra';
  db_time_region ='time-region';
 
  extra_day_list=[];
  extra_add_list=[];
  extra_cut_list=[];

  day_list=[];

  record_list=[];
  setting_list=[];
  add_key =0;

  dateObj={year:0,month:0}
  searchObj={year:0, month:0, search_y_m:new Date() }
  searchItem:any ={ 
    key:0, 
    value:{ 
      add_obj:{}, add_order_obj:{},edit_obj:{} 
    } 
  };
  locale;
  init_week_time=false;
  get_extra_time=false;
  init_extra_time= false;
  colorObj ={ on_color:'blue' }
  mobileObj={
    showItem:{key:0, value:{add_obj:'', add_order_obj:'', day:null,s_list:[]}},
    addItem:{ key:0, value:{add_obj:{s_hour:'', s_min:'', e_hour:'', e_min:''}, day:null,s_list:[]} }
  }
  uid = JSON.parse(localStorage.userInfo).uid;

  constructor(
    //private firestore:AngularFirestore,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private calendar:Calendar,
    private checkTool: CheckTool,
    private http:Firehttp,
    private timeRegionExtraServices:TimeRegionExtraServices,
    private Schedule: Schedule,
    private tool1:Tool1
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
  }

  ngOnInit(): void {
    
    this.initDateObj();
    this.initDayArray();
    this.getTimeList();
    this.getExtraTime();
    this.locale = this.calendar.localize();
  }

  ngAfterViewChecked(){
    $('.moo').popover({
      //selector:'.moo',
      trigger: 'click',
      html:true,
      content: function() {
            return $("#popoverTemplete").html()
            }
    })
   
  /**
   *   $('body').popover({
      selector:'.moo-add',
      trigger: 'click',
      html:true,
      content: function() {
            return $("#addTemplete").html()
            }
    })  
   */
      
  }



  //===========================================================  Emit ===============================================================
    onVotedOrderList(searchItem:Object) {
      // this.searchItem = searchItem;
      // this.chRef.detectChanges();
    }
 
  //===========================================================  初始化 ===============================================================
    initDateObj(){
      let currentdate = new Date();
      this.dateObj.year =this.searchObj.year = currentdate.getFullYear();
      this.dateObj.month =this.searchObj.month =  currentdate.getMonth()+1;
    }
  
    //計算出當月日期，顯示星期
    initDayArray(){
      this.day_list = this.calendar.initCalendar(this.searchObj);
      console.log(this.searchObj.month+"月",this.day_list );
    }
  
 //===========================================================  取得資料庫資料 ===============================================================
    //取得時間表設定
    getTimeList(){
      let app =this;
      let obj={ db:this.db_time_region, uid:this.uid }
      this.http.getByUid(obj, {
        success:function(data){
          app.setting_list = data;
          app.setSettingList();
        }
      });
    }

    //1.取得當月的時間表設定
    getExtraTime(){
      let app =this;
      //todo 還要在一個條件: 年/月
      let ym = this.getYMStr();
      let sObj={ ym: ym.year + ym.month}
      this.timeRegionExtraServices.getByYM(sObj, {
        success:function(data){
          app.extra_day_list = data;
          app.get_extra_time = true;
          //確定已設定完時間列表 #AAA，才添加 extra time, 
          if(app.init_week_time == true){
            app.separateExtra();
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

      //----------------- 如果添加完預約時間列表，發現還沒加入 extra time ，則加入  -------------------------------
      this.init_week_time = true;//預約時間表添加完成
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
                  sval.extra = true;
                  sval.extra_del = true;
                  sval.extra_id = list_val.id;
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
      this.day_list.forEach(function(week,key){
        week.forEach(function(slist,skey){
          slist.s_list =slist.s_list.sort(function (a, b) { 
            return a.start > b.start ? 1 : -1;//1後面 -1前面
          });
        });
      });
    }
   

 
 //=====================================================  Extra 資料庫新增刪除  ============================================================
    //詢問刪除 Extra
    goDeleteExtra(set_item, day_item){
        let app =this;
        this.ogcatDialog.confirm("刪除即無法復原，確定要刪除?",{
          success:function(data){
            app.deleteExtra(set_item, day_item.value.s_list);
          }
        })
    }
  
    //刪除 Extra
    deleteExtra(set_item, s_list){
        let app =this;
        this.http.delete(this.db, set_item.id, {
          success: function(data){
            app.ogcatTool.deleteArrayByID(s_list, set_item.id, "id");
          }
        })
    }
  

    checkAddExtra(day_item){
      let isok = this.checkTool.checkTime(day_item.value.add_obj, day_item.value.s_list);
        //檢查時段是否重複
      if(isok){
        this.addExtra(day_item);
      } 
    }
  
    //新增 Extra
    addExtra(day_item){
        let app =this;
        let n_month;
        let n_day;
        n_month = this.searchObj.month.toString();
        
        if(this.searchObj.month<10){
          n_month ='0'+ this.searchObj.month.toString();
        }
        n_day = day_item.value.day;
        if( parseInt(day_item.value.day)<10){
          n_day = '0' + day_item.value.day;
        }
       
        let item = day_item.value.add_obj; 
        let addObj= {
          ym: this.searchObj.year+ n_month,
          day:day_item.value.day,
          week: day_item.key,
          start: item.s_hour + ':' + item.s_min,
          end: item.e_hour + ':' + item.e_min,
          uid: this.uid,
          tp: '+'
        }
        this.http.create(this.db, addObj, {
          success: function(data){
            addObj["id"] = data.id;
            addObj["extra"] = true;
            day_item.value.s_list.push(addObj);
            day_item.value.add_obj ={};
            app.reSortWeek(day_item.value.s_list);
            day_item.value.is_add =false;
          }
         })
    }
 
    //新增註記刪掉的 Extra
    addExtraCut(set_item, day_item){
      let app =this;
      let n_month;
      let n_day;
      n_month = this.searchObj.month.toString();
      
      if(this.searchObj.month<10){
        n_month ='0'+ this.searchObj.month.toString();
      }
      n_day = day_item.day;
      if( parseInt(day_item.day)<10){
        n_day = '0' + day_item.day;
      }
      
      let addObj= {
        ym: this.searchObj.year+ n_month,
        day:day_item.value.day,
        week: set_item.week,
        start: set_item.start,
        end: set_item.end,
        uid: this.uid,
        tp: '-'
      }
      this.http.create(this.db, addObj, {
        success: function(data){
          set_item["extra"] = true;
          set_item["extra_del"] = true;
          app.reSortWeek(day_item.value.s_list);
         }
       })
    }

    //暫時取消
    goAddExtraCut(set_item, day_item){
      let app =this;
      this.ogcatDialog.confirm("此原時段刪除後還是可以復原，<br/>若要完全刪除請到 [設定時間表] 刪除",{
        success:function(data){
          app.addExtraCut(set_item, day_item);
        }
      })
    }

    //確認回復所刪除的原本時間
    goRecoveryCutTime(set_item, day_item){
      let app =this;
      this.ogcatDialog.confirm("您要復原此時段嗎?",{
        success:function(data){
          app.recoveryCutTime(set_item, day_item.value.s_list);
        }
      })
    }

    recoveryCutTime(set_item, day_item){
      this.http.delete(this.db, set_item.extra_id, {
        success: function(data){
          set_item.extra = null;
          set_item.extra_del = null;
        }
      })
    }
 //==========================================================  其他  ===========================================================
    //陣列排序
    reSortWeek(list){
      list = list.sort(function (a, b) { 
        return a.start > b.start ? 1 : -1;//1後面 -1前面
      });
    }

    showOrderListModal(item){
      this.searchItem = item;
      $('#orderListModal').modal("show");
    }

    goSearchByMnoth(){
      this.init_week_time=false;
      this.get_extra_time=false;
      this.init_extra_time= false;
      let s_date = this.searchObj.search_y_m;//$("#search_month").val();
      let s_year = s_date.getFullYear();
      let s_month= s_date.getMonth()+1;
      this.searchObj.year = s_year;
      this.searchObj.month = s_month;

      this.initDayArray();
      this.getTimeList();
      this.getExtraTime();
    }
 
  
    showAdd(day_item){
      day_item.is_add =true;
    }
  
 //==================  Mobile  ============================================
    mobile_showTime(item){
      this.mobileObj.showItem = item;
    }
  
    mobile_showAdd(day_item){
      this.mobileObj.addItem =day_item;
      $("#addTimeModal").modal("show");
    }

    closeAddTimeModal(){
      this.mobileObj.addItem ={ key:0, value:{add_obj:{s_hour:'', s_min:'', e_hour:'', e_min:''}, day:null,s_list:[]} }
      $("#addTimeModal").modal("hide");
    }

}




























   //=================================================  所有客戶預約的時間  =====================================================
  
   /**
    *   //依照星期取得背景顏色
    getBackgroundColor(key){
      if(key ==6){
        return ["saturday"];
      }else if(key == 0){
        return ["sunday"];
      }
    }
    */
    /**
     *  getOrderList(){
      *   let app =this;
      let params={
        year:this.searchObj.year,
        month:this.searchObj.month
      }
      this.showScheduleService.getOrderList(params,{
        success:function(data){
          if(data.result===0){
            let record = data.record;
            app.addOrderListToDayList(record);
          }
          
        },
        error:function(data){}
      });
      }
      */
  

/**
 * 
 *   //添加客戶預約時間表至日物件裡
  addOrderListToDayList(c_list){
      this.day_list.forEach(function(val, key){
        val.forEach(function(mval, mkey){
          mval.order_list = [];
          c_list.forEach(function(cval, ckey){
            let c_month = cval.order_date.split("-")[2];
            c_month = parseInt(c_month);
            if(mval.day == c_month){
              mval.order_list.push(cval);
            }
          })
          
        });
      })
      console.log("添加客戶預約時間表",this.day_list);
  }
 */

