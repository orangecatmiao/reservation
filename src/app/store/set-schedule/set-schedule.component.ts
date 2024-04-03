import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatTool, OgcatUser, OgcatDialog, OgcatDataServices } from '../../../../projects/ogcat-tool-package/src/public-api';
import { CheckTool } from '../../_factory/check-tool';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';

@Component({
  selector: 'app-set-schedule',
  templateUrl: './set-schedule.component.html',
  styleUrls: ['./set-schedule.component.scss'],
  providers:[OgcatTool, OgcatUser, OgcatDialog, CheckTool, Firehttp, Tool1]
})
export class SetScheduleComponent implements OnInit {
  title = '店家時間表設定';
  db ='time-region';
  week1=[];
  week1_add=[];
  list_key:number = 0;


  num_list =[0,1,2,3,4,5,6]; 

  week= [
    [],[],[],[],[],[],[],
  ];
  week_add=[
    [],[],[],[],[],[],[],
  ];
    
  week_add_sent=[ 
    [],[],[],[],[],[],[] 
  ];  
  
  errorMsg:string=""; 
  uid ;
  socketTimerUrl:string='';
  max_length=25;

  constructor(
    //private firestore: AngularFirestore,
    private ogcatTool: OgcatTool,
    private ogcatDialog:OgcatDialog,
    private checkTool:CheckTool,
    //private ref: ChangeDetectorRef,
    private http:Firehttp,
    private tool1:Tool1,
    private firedatabase:AngularFireDatabase,
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
    this.socketTimerUrl = 'time/'+ this.uid;
  }

  ngOnInit(): void {
    this.initAddRow();   
    this.getList();
  }

  initAddRow(){
    let len = this.num_list.length;
    for(let i=0;i<len;i++){
     this.addNew(i);
    }
  }
  
  
  
  getList(){
    let app =this;
    let obj={ db:this.db, uid: this.uid }
    this.http.getByUid(obj,{
      success:function(data){
          app.week = data;
          app.sortWeekList();
          app.reSortWeek();
      }
    });
  }
  
  addZero(item){
    let mitem =item;
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



  create(item, num){
    let app =this;
    let addObj = JSON.parse(JSON.stringify(item));
    addObj.week = num+1;
    this.organizeObj(addObj);
 
    this.http.create(this.db, addObj, {
       success:function(data){
        item.id = data.id;
        app.addNewToWeek();
        app.clearAddWeek();
        //將 item 填入原本 時間 list 中並排序
        if(app.week[num] == null){
          app.week[num] =[];
        }
        app.week[num].push(item);
        app.reSortWeek();
        //app.socketTime(); //ws
       }
    })
  }

  organizeObj(addObj){
    addObj.uid = this.uid;
    delete addObj.id;
    delete addObj.key;
    delete addObj.add;
    delete addObj.e_hour;
    delete addObj.e_min;
    delete addObj.s_hour;
    delete addObj.s_min;
  } 


  delete(item,num){
    let app = this;
    this.http.delete(this.db, item.id, {
      success:function(data){
        app.ogcatTool.deleteArrayByID(app.week[num], item.id, 'id'); //刪除陣列
       //app.socketTime(); //ws
      }
    });
  }
 
  goDelete(item,num){
    let app =this;
    this.ogcatDialog.confirm("刪除即無法復原，確定要刪除?",{
     success:function(data){
        app.delete(item, num);
     },
     cancel:function(data){
     }
   })
  }
 
  //新增 week_add 到 week 
  addNewToWeek(){
   let app = this;
   this.week_add_sent.forEach(function(val,key){
     if(val!=null){
       val.forEach(function(mval,mkey){
         if(app.week[key]==null){
           app.week[key] = [];
         }
         app.addZero(mval);
         mval.start = mval.s_hour+ ':' + mval.s_min;
         mval.end = mval.e_hour+ ':' + mval.e_min;
         app.week[key].push(mval);
       });
     }
   });
   this.reSortWeek();
  }
 
  reSortWeek(){
   this.week.forEach(function(val,key){
     if(val!=null && val.length>1){
       val = val.sort(function (a, b) { 
         return a.start > b.start ? 1 : -1;//1後面 -1前面
       });
     }
   })
 }
 
  //清空 week_add
  clearAddWeek(){
   this.week_add=[
     [],[],[],[],[],[],[],
   ];
   this.week_add_sent=[ 
     [],[],[],[],[],[],[] 
   ];
   this.initAddRow();
  }
 
  sortWeekList(){
   let sort_week = [];
   this.week.forEach(function(val:any){
     if(sort_week[val.week-1]==null){
      sort_week[val.week-1] =[];
     }
     sort_week[val.week-1].push(val);
   });
   this.week = JSON.parse(JSON.stringify(sort_week));
 }
 
 
 
  checkTime(item, week_list, num){
    let isok = this.checkTool.checkTime(item, week_list);
    if(isok){
      this.create(item, num);
    }
  }

  //==================  websoket 相關  ============================================
  socketTime(){
    let app =this;
    this.firedatabase.database.ref(this.socketTimerUrl).set({
      t: 0,//new Date().getTime()
    });
    setTimeout(function(){
      app.firedatabase.database.ref(app.socketTimerUrl).remove();
    },3000);
  }



  //=========================  addNew  新增欄位 =================================================
  addNew(num){
    var item = {
    id:'',  s_hour:'',  s_min:'', e_hour:'', e_min:'',  key: this. list_key++,  add:0
    }
    this.week_add[num].push(item);
  }

  addNewRow(item, num){
    let old_length;
    if(this.week[num] == null){
      old_length =0;
    }else{
      old_length= this.week[num].length;
    }
  
    let all = old_length + this.week_add[num].length;
    if(all> this.max_length){
      return;
    }
    if(item.add !=1 ){
      this.addNew(num);
      item.add =1;
    }
  }

  deleteNewRow(item, num){
    if(this.week_add[num].length > 1){
      this.ogcatTool.deleteArrayByID(this.week_add[num], item.key, 'key');
      this.week_add[num][this.week_add[num].length-1].add = 0;
    }
  }



}






/**
 * 
 *  checkTime(item, week_list, num){
     if( item.s_hour==''  ||  item.s_min == '' ||  item.e_hour == '' ||  item.e_min == '' ){
       this.ogcatTool.showErrorMessage("開始時間與結束時間為必填");
       return;
     }
 
     if( isNaN(item.s_hour)===true  ||  isNaN(item.s_min)===true ||  isNaN(item.e_hour)===true ||  isNaN(item.e_min)===true){
       this.ogcatTool.showErrorMessage("時間只能填入數字");
       return;
     }
 
     if( parseInt(item.s_hour)>23 || item.e_hour>23 ){
       this.ogcatTool.showErrorMessage("小時數最多為23");
       return;
     }
 
     if( parseInt(item.s_min)>59 || item.e_min>59 ){
       this.ogcatTool.showErrorMessage("分鐘數最多為59");
       return;
     }
 
 
     item.start = item.s_hour + ':' + item.s_min + ':00';
     item.end = item.e_hour + ':' + item.e_min + ':00';
 
     let error =0;
     week_list.forEach(function(val){
       if( (item.start>= val.start && item.start<= val.end) || (item.end>= val.start && item.end<= val.end)   ){
         error++;
       }
     });
     if(error>0){
       this.ogcatDialog.alert("您的時間重疊了!!");
       return;
     }
 
     this.create(item, week_list, num);
  }

 */


 /** 
  * 
  *  create(item, week_list, num){
    var ref = this.firestore.collection(this.db);
    let app =this;
    let addObj = JSON.parse(JSON.stringify(item));
    addObj.week = num+1;
    this.organizeObj(addObj);
  
    this.ogcatTool.loadingMask(true);
		ref.add(addObj).then((data) => {
        app.ogcatTool.showMessage("新增成功");
        item.id = data.id;
        app.addNewToWeek();
        app.clearAddWeek();
        //將 item 填入原本 時間 list 中並排序
        if(app.week[num] == null){
          app.week[num] =[];
        }
        app.week[num].push(item);
        app.reSortWeek();
      //  app.ref.detectChanges();
    }).catch(function(error) {
        app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{ 
        app.ogcatTool.loadingMask(false);
    });
  }
  * 
  * 
 */