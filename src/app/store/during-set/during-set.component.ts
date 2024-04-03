import { Component, OnInit } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { OgcatDataServices, OgcatUser, OgcatTool, OgcatDialog  } from '../../../../projects/ogcat-tool-package/src/public-api';
import { Firehttp } from '../../_service/firehttp';
import { Tool1 } from '../../_factory/tool1/tool1';

//export interface Shirt { name: string; price: number; } //lala
@Component({
  selector: 'app-during-set',
  templateUrl: './during-set.component.html',
  styleUrls: ['./during-set.component.scss'],
  providers:[OgcatUser, OgcatTool, OgcatDialog, Firehttp, Tool1]
})
export class DuringSetComponent implements OnInit {
  title = '預約時段設定';
  db ='during';
  cInfo :any ={ description:''};
  
  list:any =[];
  add_list:any =[];
  list_key:number =0;
  max_length:number=4
  uid;

  socketChangelUrl:string="";
 
  constructor(
    //private ds: OgcatDataServices,
    //private auth:AngularFireAuth, 
    //private firestore: AngularFirestore,
    //private ogcatUser:OgcatUser,
    private firedatabase :AngularFireDatabase,
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private http:Firehttp,
    private tool1:Tool1
   // private ref: ChangeDetectorRef,
   // private router:Router
     
  ) { 
    this.uid = this.tool1.getSessionUserInfo().uid;
    this.socketChangelUrl = 'during/'+ this.uid;
  }

  ngOnInit(): void {
    this.getList();
  }

  getList(){
    let app =this;
    let obj={ db:this.db, uid: this.uid }
    this.http.getByUid(obj ,{
      success:function(data){
          app.list = data;
          app.reSortWeek(app.list);
          if(app.list.length<(app.max_length+1) ){
            app.addNew();
          }
      }
    });
  }

  showEdit(item){
    item.is_edit =true;
  }

  goCreate(item){
    if(item.during==null || item.during==""){
      this.ogcatTool.showErrorMessage("必須填寫分鐘數");
      return;
    }else if(isNaN(item.during)){
      this.ogcatTool.showErrorMessage("分鐘數必須是數字");
      return;
    }else if(item.price==null || item.price==""){
      this.ogcatTool.showErrorMessage("必須填寫價格");
      return;
    }else if(isNaN(item.price)){
      this.ogcatTool.showErrorMessage("價格必須是數字");
      return;
    }
    this.create(item);
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
    let updateObj = {
      i_name: item.i_name,
      during: item.during,
      price:item.price
    };
    this.http.update(this.db, item.id, updateObj, {
      success:function(data){
        item.is_edit = false;
        //app.socketAddChange();
      }
    });
  }

  create(item){
    let uid = this.uid;
    let app =this;
    let addObj ={
      i_name: item.i_name,
      during: item.during,
      price: item.price,
      uid:uid
		}
    this.http.create(this.db, addObj,{
      success:function(data){
        addObj["id"] = data.id;
        app.list.push(addObj);
        app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key');
       // app.socketAddChange();
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
  


//=========================  websocket 寫入 =================================================
  socketAddChange(){
    let app =this;
    this.firedatabase.database.ref(this.socketChangelUrl).set({
      t: 0,
    });
    setTimeout(function(){
      app.firedatabase.database.ref(app.socketChangelUrl).remove();
    },3000);
  }


  //=========================  addNew  新增欄位 =================================================
  addNew(){
    var item = {
      id:'',  during:'',  price:'', i_name:'', key: this.list_key++,  add:0
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
      return parseInt(a.during) > parseInt(b.during) ? 1 : -1;//1後面 -1前面
    });
  }



}


























/**
 * 
 * 
 *   getList(){
    let app =this;
    this.ogcatTool.loadingMask(true);
    
    this.firestore.collection('during').ref.where('uid','==',this.uid).get().then((querySnapshot) => {
      querySnapshot.forEach(function(doc) {
        let obj = doc.data();
        obj.id = doc.id;
        obj.copy = JSON.parse(JSON.stringify(obj));
        app.list.push(obj);
        // console.log(doc.id, " => ", doc.data());
       });
       if(app.list.length<5){
        app.addNew();
       }
    }).catch(function(error) {
      app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{ 
        app.ogcatTool.loadingMask(false);
    });
    
  }




    create(item){
   
    let uid = JSON.parse(localStorage.userInfo).uid;
    var ref = this.firestore.collection('during');
    let app =this;
    let addObj ={
      id:null,
      during: item.during,
      price: item.price,
      uid:uid
		}
    this.ogcatTool.loadingMask(true);
		ref.add(addObj).then((data) => {
        app.ogcatTool.showMessage("新增成功");
        addObj.id = data.id;
       
        app.list.push(addObj);
        app.add_list = app.ogcatTool.deleteArrayByID(app.add_list, item.key , 'key')
      
    }).catch(function(error) {
        app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{ 
        app.ogcatTool.loadingMask(false);
    });
  }





  update(item){
    let app =this;
    let updateObj = {
      during: item.during,
      price:item.price
    };
    this.ogcatTool.loadingMask(true);
    this.firestore.collection('during').doc(item.id).update(updateObj).then(function() {
      item.is_edit = false;
      app.ogcatTool.showMessage("修改成功 !!");
    }).catch(function(error) {
        app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{ 
        app.ogcatTool.loadingMask(false);
    });
  }





 delete(item){
    let app =this;
    this.ogcatTool.loadingMask(true);
    this.firestore.collection('during').doc(item.id).delete()
    .then(function() {
        app.list = app.ogcatTool.deleteArrayByID(app.list, item.key , 'key')
        app.ogcatTool.showMessage("刪除成功 !!");
    }).catch(function(error) {
        app.ogcatTool.showErrorMessage(error);
    }).finally(()=>{ 
        app.ogcatTool.loadingMask(false);
    });
  }


 */