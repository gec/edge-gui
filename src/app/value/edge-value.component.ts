
import {Component, Input, OnInit} from "@angular/core";
import {EdgeValue, ListValue, MapValue, TaggedValue} from "../edge/edge-data";

@Component({
  selector: 'edge-value',
  template: `
    <div *ngIf="typeString(value) === 'tagged'" class="edge-value-block edge-value-tag">
      <div class="edge-value-tag-open"><span class="edge-value-tag-name">{{value.tag}}</span><span> {{ '{' }} </span></div>
      <div class="edge-value-tag-body"><edge-value [value]="value.value"></edge-value></div>
      <div class="edge-value-tag-close"><span> {{ '}' }} </span></div>
    </div>
    <div *ngIf="typeString(value) === 'map'" class="edge-value-block edge-value-map">
      <edge-value-map-inner [fields]="value.value.pairs()"></edge-value-map-inner>
    </div>
    <div *ngIf="typeString(value) === 'list'" class="edge-value-block edge-value-list">
      <ul>
        <li *ngFor="let item of value.value"><edge-value [value]="item"></edge-value></li>
      </ul>
    </div>
    <edge-value-scalar *ngIf="typeString(value) === 'scalar'" [value]="value" class="edge-value-block"></edge-value-scalar>
    <!--<div *ngIf="typeString(value) === 'scalar'" class="edge-value-block edge-value-scalar">
      <edge-value-scalar [value]="value"></edge-value-scalar>
    </div>-->
  `,
  styles: [
    `
      .edge-value-block {
        margin-left: 8px;
        background-color: #fafafa;
      }

      li {
        display: block;
        border: 0px;
      }
    `
  ]
})
export class EdgeValueComponent {
  @Input() value: EdgeValue;

  typeString(value: EdgeValue): string {
    if (value instanceof TaggedValue) {
      return "tagged";
    } else if (value instanceof ListValue) {
      //console.log("LIST: " + value.toStringKey());
      return "list";
    }  else if (value instanceof MapValue) {
      return "map";
    } else {
      return "scalar";
    }
  }
}
