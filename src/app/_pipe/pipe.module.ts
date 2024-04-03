import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayShow, ym, ZDay, OrderStatus, Nl2br } from './pipe1';


@NgModule({
  declarations: [PayShow, ym, ZDay, OrderStatus, Nl2br],
  imports: [
    CommonModule
  ],
  exports:[PayShow, ym, ZDay, OrderStatus, Nl2br]
})
export class PipeModule1 { }
