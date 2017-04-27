
import { KeyState } from "../edge/edge-key-db";
import { Component, Input } from "@angular/core";
import { EdgeValue } from "../edge/edge-data";
import { PathMap } from "../edge/edge-model";
import { PathValueRecord } from "../record/descriptor-records";

@Component({
  selector: 'metadata-desc-table',
  templateUrl: './metadata-desc-table.component.html',
})
export class MetadataDescTableComponent {
  @Input() metadata: PathValueRecord[]
}
