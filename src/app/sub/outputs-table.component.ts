import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";
import { EndpointPath } from "../edge/edge-model";

@Component({
  selector: 'outputs-table',
  templateUrl: './outputs-table.component.html',
})
export class OutputsTableComponent {

  @Input() states: KeyState[];

}
