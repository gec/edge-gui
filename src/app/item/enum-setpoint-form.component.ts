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
