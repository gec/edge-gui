
import { Component, Input } from "@angular/core";
import { Path } from "../edge/edge-model";

@Component({
  selector: 'edge-path',
  template: `
    <span *ngFor="let part of path.part; let last = last;">
        <span *ngIf="!last" class="edge-path-part edge-path-part-init">{{part}} / </span>
        <span *ngIf="last" class="edge-path-part edge-path-part-last">{{part}}</span>
    </span>
  `,
})
export class EdgePathComponent {
  @Input() path: Path;
}
