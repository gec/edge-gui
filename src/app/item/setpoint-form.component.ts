
import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";
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
      this.service.issueOutputRequest(key, new DoubleValue(value));
    }
  }
}