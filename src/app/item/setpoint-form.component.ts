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
import { KeyState, OutputStatusStateValue } from "../edge/edge-key-db";
import { EndpointPath } from "../edge/edge-model";
import { EdgeConsumerService } from "../edge-consumer.service";
import { DoubleValue } from "../edge/edge-data";
import { isNullOrUndefined } from "util";

@Component({
  selector: 'setpoint-form',
  template: `
    <form>
      <input type="text" class="form-control ng-pristine ng-valid ng-valid-pattern" [(ngModel)]="inputValue" name="setpoint_value" ng-pattern="pattern" style="width:6em;" placeholder="decimal">
      <button type="button" class="btn btn-primary" style="border-top-left-radius: 0; border-bottom-left-radius: 0;" (click)="issueValue(state.key, inputValue)">
        Set
        <span style="padding-right: 0.5em;"> </span><i ng-class="executeClasses" class="fa fa-sign-in"></i>
      </button>
    </form>
  `,
})
export class SetpointFormComponent {
  @Input() state: KeyState;
  inputValue: number;

  constructor(private service: EdgeConsumerService) {}


  issueValue(key: EndpointPath, value: number) {
    if (!isNullOrUndefined(value)) {
      let v = value;
      console.log("Originally: " + v);
      if (!isNullOrUndefined(this.state.value) && this.state.value instanceof OutputStatusStateValue) {
        let outValue = this.state.value;
        if (!isNullOrUndefined(outValue.requestScale)) {
          v = v * outValue.requestScale;
        }
        if (!isNullOrUndefined(outValue.requestOffset)) {
          v = v + outValue.requestOffset;
        }
      }
      console.log("Issuing: " + v);

      this.service.issueOutputRequest(key, new DoubleValue(v));
    }
  }
}
