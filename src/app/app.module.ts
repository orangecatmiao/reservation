import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';//primeNG 會用到
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';


import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';


import { PipeModule } from'../../projects/ogcat-tool-package/src/lib/_pipe/pipe.module';


import { OgcatToolPackageModule } from '../../projects/ogcat-tool-package/src/lib/ogcat-tool-package.module';//如果只使用到 function, factory 而沒使用到 component 則不需要 import


import { AppComponent } from './app.component';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ForgetPasswordComponent } from './user/forget-password/forget-password.component';
import { RouteAdminComponent } from './sub-router/route-admin/route-admin.component';
import { RouteUserComponent } from './sub-router/route-user/route-user.component';
import { RouteStoreComponent } from './sub-router/route-store/route-store.component';
import { RoutePageComponent } from './sub-router/route-page/route-page.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { UpdatePasswordComponent } from './member/update-password/update-password.component';
import { MemberInfoComponent } from './member/member-info/member-info.component';

import { StorePageComponent } from './store/store-page/store-page.component';
import { DuringSetComponent } from './store/during-set/during-set.component';
import { SetScheduleComponent } from './store/set-schedule/set-schedule.component';
import { ShowScheduleComponent } from './store/show-schedule/show-schedule.component';
import { MyOrderComponent } from './member/my-order/my-order.component';
import { CustomerOrderComponent } from './store/customer-order/customer-order.component';

import { CustomerNoteComponent } from './store/customer-note/customer-note.component';
import { OrderListComponent } from './store/show-schedule/order-list/order-list.component';
import { PhotoComponent } from './photo/photo.component';
import { StoreShowComponent } from './user/store-show/store-show.component';
import { ScheduleShowComponent } from './user/schedule-show/schedule-show.component';
import { OrderListShowComponent } from './user/schedule-show/order-list-show/order-list-show.component';


//primeNG
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputMaskModule} from 'primeng/inputmask';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {TabViewModule} from 'primeng/tabview';

//Angular Material
import { DragDropModule } from '@angular/cdk/drag-drop';

//pipe module
import { PipeModule1 } from './_pipe/pipe.module';
import { DialogModule } from 'primeng/dialog';

//auth 驗證組件
import { authGuard } from './../authGuard';


import { Calendar } from './_factory/calendar';
import { AboutWebsiteComponent } from './user/about-website/about-website.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MonthSetComponent } from './store/month-set/month-set.component';
import { MyFavoriteComponent } from './member/my-favorite/my-favorite.component';
import { PrivacyComponent } from './page/privacy/privacy.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    RouteAdminComponent,
    RouteUserComponent,
    RouteStoreComponent,
    RoutePageComponent,
    HeaderComponent,
    FooterComponent,
    UpdatePasswordComponent,

 
    StorePageComponent,
    DuringSetComponent,
    SetScheduleComponent,
    ShowScheduleComponent,
    MyOrderComponent,
    CustomerOrderComponent,
    MemberInfoComponent,
    CustomerNoteComponent,
    OrderListComponent,
    PhotoComponent,
    StoreShowComponent,
    ScheduleShowComponent,
    OrderListShowComponent,
    AboutWebsiteComponent,
    MonthSetComponent,
    MyFavoriteComponent,
    PrivacyComponent,
   
   
    


 

  ],
  imports: [
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule, 

    FormsModule,
    PipeModule,
    PipeModule1,
    ReactiveFormsModule,
    OgcatToolPackageModule,
    ButtonModule,
    CalendarModule,
    InputSwitchModule,
    InputMaskModule,
    DialogModule,
    TabViewModule,
    AutoCompleteModule,
    AngularFireModule.initializeApp(environment.firebase),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [authGuard, Calendar ],
  bootstrap: [AppComponent]
})
export class AppModule { }
