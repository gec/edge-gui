import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndpointComponent } from "./endpoint.component";
import { EndpointDescComponent } from "./endpoint-desc.component";

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  //{ path: 'dashboard',  component: DashboardComponent },
  { path: 'endpoint/:id', component: EndpointComponent },
  { path: 'endpointdesc/:id', component: EndpointDescComponent }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
