import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EdgeConsumerService } from "./edge-consumer.service";
import { AppRoutingModule } from "./app-routing.module";
import { EndpointComponent } from "./endpoint.component";

@NgModule({
  declarations: [
    AppComponent,
    EndpointComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    EdgeConsumerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
