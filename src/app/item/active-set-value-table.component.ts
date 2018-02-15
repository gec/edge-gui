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

import { Component, Input } from "@angular/core";
import { ActiveSetValue } from "../edge/edge-key-db";


@Component({
  selector: 'active-set-value-table',
  template: `
    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th style="text-align: left">Key</th>
          <th style="text-align: right">Value</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let kv of value?.kvs">
          <td style="text-align: left"><edge-value [value]="kv.key"></edge-value></td>
          <td style="text-align: right">
            <edge-value [value]="kv.value"></edge-value>
            <!--<button type="button" class="btn btn-default" data-toggle="modal" data-target="#keyValueObjectModal" data-key="akey" (click)="setModalState(state)">
              <span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>
            </button>-->
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ActiveSetValueTableComponent {
  @Input() value: ActiveSetValue;
}
