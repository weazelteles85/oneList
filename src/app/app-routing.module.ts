import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsLoggedGuard } from './core/is-logged.guard';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule', canActivate:[IsLoggedGuard] },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'payment', loadChildren: './payment/payment.module#PaymentPageModule' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
