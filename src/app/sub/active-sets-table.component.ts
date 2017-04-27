
import { KeyState } from "../edge/edge-key-db";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'active-sets-table',
  templateUrl: './active-sets-table.component.html',
})
export class ActiveSetsTableComponent {
  @Input() states: KeyState[];
  modalState?: KeyState;

  setModalState(state: KeyState) {
    this.modalState = state;
  }
}
