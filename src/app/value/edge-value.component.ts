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

import {Component, Input, OnInit} from "@angular/core";
import {EdgeValue, ListValue, MapValue, TaggedValue} from "../edge/edge-data";

@Component({
  selector: 'edge-value',
  template: `
    <div *ngIf="typeString(value) === 'tagged'" class="edge-value-block edge-value-tag">
      <div class="edge-value-tag-open"><span class="edge-value-tag-name">{{value.tag}}</span><span> {{ '{' }} </span></div>
      <div class="edge-value-tag-body"><edge-value [value]="value.value"></edge-value></div>
      <div class="edge-value-tag-close"><span> {{ '}' }} </span></div>
    </div>
    <div *ngIf="typeString(value) === 'map'" class="edge-value-block edge-value-map">
      <edge-value-map-inner [fields]="value.value.pairs()"></edge-value-map-inner>
    </div>
    <div *ngIf="typeString(value) === 'list'" class="edge-value-block edge-value-list">
      <ul>
        <li *ngFor="let item of value.value"><edge-value [value]="item"></edge-value></li>
      </ul>
    </div>
    <edge-value-scalar *ngIf="typeString(value) === 'scalar'" [value]="value" class="edge-value-block"></edge-value-scalar>
    <!--<div *ngIf="typeString(value) === 'scalar'" class="edge-value-block edge-value-scalar">
      <edge-value-scalar [value]="value"></edge-value-scalar>
    </div>-->
  `,
  styles: [
    `
      .edge-value-block {
        margin-left: 8px;
        background-color: #fafafa;
      }

      li {
        display: block;
        border: 0px;
      }
    `
  ]
})
export class EdgeValueComponent {
  @Input() value: EdgeValue;

  typeString(value: EdgeValue): string {
    if (value instanceof TaggedValue) {
      return "tagged";
    } else if (value instanceof ListValue) {
      //console.log("LIST: " + value.toStringKey());
      return "list";
    }  else if (value instanceof MapValue) {
      return "map";
    } else {
      return "scalar";
    }
  }
}
