import { Component, OnInit, ChangeDetectorRef, NgZone  } from '@angular/core';
import { Subscription } from 'rxjs';
import { Msub1 } from '../../_data-services/msub1';

import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';
import { Calendar } from '../../_factory/calendar';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-month-set',
  templateUrl: './month-set.component.html',
  styleUrls: ['./month-set.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1, Calendar]
})
export class MonthSetComponent implements OnInit {
  
  subscription1: Subscription;
  storeInfo={id:'', uid:'', store_name:'', description:'', img_token:'', month_set:false };
  list:any =[];
  add_list:any =[];
  list_key:number =0;
  max_length=5;
  uid;
  db = environment.db.month_set;
  locale;
  checked:boolean;
  error_msg:string='';

  constructor(
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private msub1 :Msub1,
    private http:Firehttp,
    private tool1:Tool1,
    private calendar:Calendar,
    private ref: ChangeDetectorRef,
    private zone: NgZone
  ) {
      
      this.subscription1 = this.msub1.getStoreInfo().subscribe(x => { if(x!=null){this.storeInfo = x;}  });
      this.uid = this.tool1.getSessionUserInfo().uid;
   }

    ngOnInit(): void {
      this.locale = this.calendar.localize();
      this.getList();
    }

    getList(){
      let app =this;
      let obj={ db:this.db, uid: this.uid }
      this.http.getByUid(obj ,{
        success:function(data){
            app.list = data;
            app.reSetYm();
            app.reSortWeek(app.list);
            if(app.list.length<(app.max_length+1) ){
              app.addNew();
            }
        }
      });
    }

    reSetYm(){
      this.list.forEach(function(val){
        val.ym = new Date(val.ym);
      })
    }

    showEdit(item){
      item.is_edit =true;
    }
  
    goDelete(item){
      let app =this;
      this.ogcatDialog.confirm("刪除即無法復原，確定要刪除?",{
       success:function(){
          app.delete(item);
       }
     })
    }
  
    update(item){
      let app =this;
      let ym =  this.calendar.getStrYMbyObj(item.ym);
      let updateObj = {
        ym: ym,
      };
      this.http.update(this.db, item.id, updateObj, {
        success:function(data){
          item.copy.ym =ym;
          item.is_edit = false;//app.socketAddChange();
          app.reSortWeek(app.list);
        }
      });
    }

    goCreate(item){
      if(item.ym ==null || item.ym==''){
        this.ogcatTool.showErrorMessage("預約月份欄位不可為空");
        return;
      }
      //檢查年月份是否重複
      let repeat = this.cheskAddRepeat(item);
      if(repeat>0){
        this.ogcatTool.showErrorMessage("月份重複了");
        return;
      }
      this.create(item);
    }

    cheskAddRepeat(item){
      let ym = item.ym;
      let repeat_count:number=0;
      this.list.forEach(function(val){
      
         if(ym>new Date(val.ym) || ym<new Date(val.ym) ){
         }else{
          repeat_count++;
         }  
      });
     return repeat_count;
    }

    create(item){
      let uid = this.uid;
      let app =this;
      let ym =  this.calendar.getStrYMbyObj(item.ym);
      let addObj ={
        ym: ym,
        uid:uid
      }
     
      this.http.create(this.db, addObj,{
        success:function(data){
          addObj["id"] = data.id;
          addObj["copy"]={ym:ym};
          app.list.push(addObj);
          app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key');
          app.reSortWeek(app.list);
        }
      });
    }
  
    delete(item){
      let app =this;
      this.http.delete(this.db, item.id,{
        success: function(data){
          app.list = app.ogcatTool.deleteArrayByID(app.list, item.id , 'id');
         // app.socketAddChange();
        }
      });
    }
  
    cancelDelete(item){
      item.price = item.copy.price;
      item.during = item.copy.during;
      item.is_edit=false;
    }
    

    //=========================  addNew  新增欄位 =================================================
    addNew(){
      var item = {
        id:'',  ym:'', key: this.list_key++,  add:0
      }
      this.add_list.push(item);
    }
    addNewRow(item){
      let old_length = this.list.length;
      let all = old_length + this.add_list.length;
      if(all>this.max_length){
        return;
      }
      
      if(item.add !=1 ){
        this.addNew(); 
        item.add =1;
      }
    }

    deleteNewRow(item){
      if(this.add_list.length > 1){
        this.ogcatTool.deleteArrayByID(this.add_list, item.key, 'key');
        this.add_list[this.add_list.length-1].add = 0;
      }
    }

    //陣列排序
    reSortWeek(list){
      list = list.sort(function (a, b) { 
        return a.ym > b.ym ? 1 : -1;//1後面 -1前面
      });
    }
  
    switchChange(event){
      let app =this;
      if(this.storeInfo==null || this.storeInfo.id==''){
        //this.zone.runOutsideAngular(()=>{
          setTimeout(function(){ app.storeInfo.month_set = !event.checked;},300);
        //});
        this.error_msg = "您必須先到 [設定商店頁面] 建立商店資訊，才能設定這個項目";
        this.ogcatTool.showErrorMessage(this.error_msg);
        return;
      }

      this.ogcatDialog.confirm("您要變更狀態嗎?",{
        success:function(){
            app.updateMonthSet(event.checked);
        },
        error: function(){
          app.storeInfo.month_set = !event.checked;
        }
      });
    }

    updateMonthSet(bool){
      let updateObj={
        month_set:bool
      }
      this.http.update(environment.db.store_info, this.storeInfo.id, updateObj, {
        success: function(data){

        }
      })  
    }
  

}
