import {Component, Input} from "@angular/core";
import {
  BoolValue,
  DoubleValue, EdgeValue, FloatValue, SInt32Value, SInt64Value, StringValue, UInt32Value,
  UInt64Value
} from "../edge/edge-data";

@Component({
  selector: 'edge-value-scalar',
  template: `
    <span [ngSwitch]="scalarType()">
      <span *ngSwitchCase="'numeric'" class="edge-value-scalar edge-value-scalar-numeric">{{value.value}}</span>
      <span *ngSwitchCase="'string'" class="edge-value-scalar edge-value-scalar-string">"{{value.value}}"</span>
      <span *ngSwitchCase="'boolean'" class="edge-value-scalar edge-value-scalar-boolean">{{value.value}}</span>
    </span>
    <!--<div *ngIf="isNumeric()" class="edge-value-scalar edge-value-scalar-numeric">{{value.value}}</div>
    <div *ngIf="isString()" class="edge-value-scalar edge-value-scalar-string">{{value.value}}</div>-->
    
  `,
  styles: []
})
export class EdgeValueScalarComponent {
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
