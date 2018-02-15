/**
 * Copyright 2011-2018 Green Energy Corp.
 *
 * Licensed to Green Energy Corp (www.greenenergycorp.com) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. Green Energy
 * Corp licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
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
import { OutputsTableComponent } from "./sub/outputs-table.component";
import { SetpointFormComponent } from "./item/setpoint-form.component";
import { IndicationFormComponent } from "./item/indication-form.component";
import { EnumSetpointFormComponent } from "./item/enum-setpoint-form.component";
import {EventTabularValueComponent} from "./item/event-tabular-value.component";
import { EndpointDescComponent } from "./endpoint-desc.component";
import { MetadataDescTableComponent } from "./sub/metadata-desc-table.component";
import { ActiveSetsTableComponent } from "./sub/active-sets-table.component";
import { ActiveSetValueTableComponent } from "./item/active-set-value-table.component";

@NgModule({
  declarations: [
    AppComponent,
    EndpointComponent,
    EndpointDescComponent,

    SeriesTableComponent,
    KeyValueTableComponent,
    EventKeysTableComponent,
    OutputsTableComponent,
    ActiveSetsTableComponent,


    EdgePathComponent,
    SetpointFormComponent,
    IndicationFormComponent,
    EnumSetpointFormComponent,
    EventTabularValueComponent,
    MetadataDescTableComponent,
    ActiveSetValueTableComponent,

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
