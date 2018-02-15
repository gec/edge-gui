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



import {Component, Input} from "@angular/core";

import {
  BoolValue,
  DoubleValue, EdgeValue, FloatValue, SInt32Value, SInt64Value, StringValue, UInt32Value,
  UInt64Value
} from "../edge/edge-data";

@Component({
  selector: 'event-tabular-value',
  template: `
    <span [ngSwitch]="scalarType()">
      <span *ngSwitchCase="'numeric'">{{value.value}}</span>
      <span *ngSwitchCase="'string'">{{value.value}}</span>
      <span *ngSwitchCase="'boolean'">{{value.value}}</span>
      <span *ngSwitchDefault><em>[...]</em></span>
    </span>
  `,
  styles: []
})
export class EventTabularValueComponent {
  @Input() value: EdgeValue;

  scalarType(): string {
    if (this.isNumeric()) {
      return "numeric";
    } else if (this.isString()) {
      return "string";
    } else if (this.isBoolean()) {
      return "boolean";
    } else {
      return "unknown";
    }
  }

  isNumeric(): boolean {
    let value = this.value;
    return value instanceof FloatValue ||
      value instanceof DoubleValue ||
      value instanceof SInt32Value ||
      value instanceof UInt32Value ||
      value instanceof SInt64Value ||
      value instanceof UInt64Value;
  }

  isString(): boolean  {
    let value = this.value;
    return value instanceof StringValue;
  }
  isBoolean(): boolean  {
    let value = this.value;
    return value instanceof BoolValue;
  }

}
