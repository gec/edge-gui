
import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";
import { EndpointPath } from "../edge/edge-model";
import { EdgeConsumerService } from "../edge-consumer.service";

@Component({
  selector: 'indication-form',
  template: `
    <button type="button" class="btn btn-default" (click)="issueIndication(state.key)">
      <span class="glyphicon glyphicon-circle-arrow-down" aria-hidden="true"></span>
    </button>
  `,
})
export class IndicationFormComponent {
  @Input() state: KeyState;

  constructor(private service: EdgeConsumerService) {}

  issueIndication(key: EndpointPath) {
    console.log("got:");
    console.log(key);
    this.service.issueOutputRequest(key);
  }
}
