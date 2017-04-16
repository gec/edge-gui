import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndpointComponent } from "./endpoint.component";

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  //{ path: 'dashboard',  component: DashboardComponent },
  { path: 'endpoint/:id', component: EndpointComponent }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
