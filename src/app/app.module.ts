import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EdgeConsumerService } from "./edge-consumer.service";
import { AppRoutingModule } from "./app-routing.module";
import { EndpointComponent } from "./endpoint.component";
import { SeriesTableComponent } from "./sub/series-table.component";
import { EdgePathComponent } from "./item/edge-path.component";
import { KeyValueTableComponent } from "./sub/kv-table.component";
import { EventKeysTableComponent } from "./sub/event-keys-table.component";
import {EdgeValueComponent} from "./value/edge-value.component";
import {EdgeValueScalarComponent} from "./value/edge-value-scalar.component";
import {EdgeValueMapInnerComponent} from "./value/edge-value-map-inner.component";
import {EdgeValueFieldNameComponent} from "./value/edge-value-field-name.component";

@NgModule({
  declarations: [
    AppComponent,
    EndpointComponent,

    SeriesTableComponent,
    KeyValueTableComponent,
    EventKeysTableComponent,

    EdgePathComponent,
    EdgeValueComponent,
    EdgeValueScalarComponent,
    EdgeValueMapInnerComponent,
    EdgeValueFieldNameComponent,
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
