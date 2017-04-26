


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
