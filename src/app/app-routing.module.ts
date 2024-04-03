import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Sub-Router
import { RouteAdminComponent } from './sub-router/route-admin/route-admin.component';
import { RoutePageComponent } from './sub-router/route-page/route-page.component';
import { RouteStoreComponent } from './sub-router/route-store/route-store.component';
import { RouteUserComponent } from './sub-router/route-user/route-user.component';

import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ForgetPasswordComponent } from './user/forget-password/forget-password.component';


//會員中心
import { MemberInfoComponent } from './member/member-info/member-info.component';
import { UpdatePasswordComponent } from './member/update-password/update-password.component';
import { MyOrderComponent } from './member/my-order/my-order.component';
import { MyFavoriteComponent } from './member/my-favorite/my-favorite.component';



//我的商店
import { CustomerOrderComponent } from './store/customer-order/customer-order.component';
import { DuringSetComponent } from './store/during-set/during-set.component';
import { SetScheduleComponent } from './store/set-schedule/set-schedule.component';
import { ShowScheduleComponent } from './store/show-schedule/show-schedule.component';
import { StorePageComponent } from './store/store-page/store-page.component';
import { MonthSetComponent } from './store/month-set/month-set.component';

//前台頁面
import { StoreShowComponent } from './user/store-show/store-show.component';
import { ScheduleShowComponent } from './user/schedule-show/schedule-show.component';

import { AboutWebsiteComponent } from './user/about-website/about-website.component';


//page
import { PrivacyComponent } from './page/privacy/privacy.component';


//
import { authGuard } from './../authGuard';

let user="user";
let member="member";
let store="store";
let page="page";
let admin="admin";

const routes: Routes = [
  { path: '', redirectTo: '/user/login', pathMatch: 'full' }, 
  //======================== 前台 ================================================================================
  { path: user, component: RouteUserComponent,
    children: [
        //註冊
        { path: 'register',  component: RegisterComponent  },
        { path: 'login',  component: LoginComponent },
        { path: 'forget-password',  component: ForgetPasswordComponent },
        { path: 'store-show',  component: StoreShowComponent },
        { path: 'store-show/:id',  component: StoreShowComponent },
        { path: 'schedule-show',  component: ScheduleShowComponent },
        { path: 'schedule-show/:id',  component: ScheduleShowComponent },
        { path: 'about-website',  component: AboutWebsiteComponent },
        
    ]
  },
  { path: member, component: RouteUserComponent,
    children: [
        { path: 'member-info',  component: MemberInfoComponent, canActivate: [authGuard]  },
        { path: 'update-password',  component: UpdatePasswordComponent, canActivate: [authGuard]  },
        { path: 'my-order',  component: MyOrderComponent, canActivate: [authGuard]  },
        { path: 'my-order/:id',  component: MyOrderComponent, canActivate: [authGuard]  },
        { path: 'my-favorite',  component: MyFavoriteComponent, canActivate: [authGuard]  },
        
    ]
  },
  { path: store, component: RouteUserComponent,
    children: [
        { path: 'during-set',  component: DuringSetComponent, canActivate: [authGuard] },
        { path: 'month-set',  component: MonthSetComponent, canActivate: [authGuard] },
        
        { path: 'set-schedule',  component: SetScheduleComponent, canActivate: [authGuard] },
        { path: 'show-schedule',  component: ShowScheduleComponent, canActivate: [authGuard] },
        { path: 'store-page',  component: StorePageComponent, canActivate: [authGuard] },
        { path: 'customer-order',  component: CustomerOrderComponent, canActivate: [authGuard] },
        { path: 'customer-order/:id',  component: CustomerOrderComponent, canActivate: [authGuard] },
    ]
  },
  { path: page, component: RouteUserComponent,
    children: [
        { path: 'privacy',  component: PrivacyComponent  },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
