
import { Component, Input } from "@angular/core";
import { EdgeValue, TaggedValue } from "../edge/edge-data";

@Component({
  selector: 'edge-path',
  template: `
    <span *ngIf=""></span>
  `,
})
export class EdgeValueComponents {
  @Input() value: EdgeValue;
  typeString(): string {
    if (this.value instanceof TaggedValue) {
      return "tagged";
    } else {
      return "basic";
    }
  }
}
