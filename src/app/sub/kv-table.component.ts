
import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";

@Component({
  selector: 'key-value-table',
  templateUrl: './kv-table.component.html',
})
export class KeyValueTableComponent {
  @Input() states: KeyState[];
  modalState?: KeyState;

  setModalState(state: KeyState) {
    this.modalState = state;
  }
}
