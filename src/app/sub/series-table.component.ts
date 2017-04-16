

import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";

@Component({
  selector: 'series-table',
  templateUrl: './series-table.component.html',
})
export class SeriesTableComponent {

  @Input() states: KeyState[];

}
