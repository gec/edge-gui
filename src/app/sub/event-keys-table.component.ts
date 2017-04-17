
import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";

@Component({
  selector: 'event-keys-table',
  templateUrl: './event-keys-table.component.html',
})
export class EventKeysTableComponent {

  @Input() states: KeyState[];
}
