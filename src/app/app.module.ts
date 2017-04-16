import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EdgeConsumerService } from "./edge-consumer.service";
import { AppRoutingModule } from "./app-routing.module";
import { EndpointComponent } from "./endpoint.component";
import { SeriesTableComponent } from "./sub/series-table.component";
import { EdgePathComponent } from "./item/edge-path.component";

@NgModule({
  declarations: [
    AppComponent,
    EndpointComponent,

    SeriesTableComponent,

    EdgePathComponent,
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
