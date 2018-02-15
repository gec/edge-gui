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
import { KeyState } from "../edge/edge-key-db";
import { EdgeConsumerService } from "../edge-consumer.service";
import {  UInt32Value } from "../edge/edge-data";
import { isNullOrUndefined } from "util";

@Component({
  selector: 'enum-setpoint-form',
  template: `
    <form>
      <select class="pull-right" name="singleSelect" id="singleSelect" [(ngModel)]="inputValue" (change)="issueValue()">
        <option [value]="null">--- select mode ---</option>
        <option *ngFor="let map of state.value?.integerLabels" [value]="map[1]">{{map[0]}}</option>
      </select>
    </form>
  `,
})
export class EnumSetpointFormComponent {
  @Input() state: KeyState;
  inputValue: number;

  constructor(private service: EdgeConsumerService) {}

  issueValue() {
    console.log("Issued: ");
    console.log(this.inputValue);
    if (!isNullOrUndefined(this.inputValue)) {
      this.service.issueOutputRequest(this.state.key, new UInt32Value(this.inputValue));
    }
  }
}
