
import { Component, Input } from "@angular/core";
import { ActiveSetValue } from "../edge/edge-key-db";


@Component({
  selector: 'active-set-value-table',
  template: `
    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th style="text-align: left">Key</th>
          <th style="text-align: right">Value</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let kv of value?.kvs">
          <td style="text-align: left"><edge-value [value]="kv.key"></edge-value></td>
          <td style="text-align: right">
            <edge-value [value]="kv.value"></edge-value>
            <!--<button type="button" class="btn btn-default" data-toggle="modal" data-target="#keyValueObjectModal" data-key="akey" (click)="setModalState(state)">
              <span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>
            </button>-->
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ActiveSetValueTableComponent {
  @Input() value: ActiveSetValue;
}
