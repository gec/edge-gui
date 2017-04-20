
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
      <div *ngFor="let field of value.value.pairs()">
        <div *ngIf="type"></div>
        <div><edge-value [value]="field[0]"></edge-value></div>
        <div><edge-value [value]="field[1]"></edge-value></div>
      </div>
    </div>
    <div *ngIf="typeString(value) === 'list'" class="edge-value-block edge-value-list">
      <ul>
        <li *ngFor="let item of value.value"><edge-value [value]="item"></edge-value></li>
      </ul>
    </div>
    <div *ngIf="typeString(value) === 'scalar'" class="edge-value-block edge-value-scalar">{{value.value}}</div>
  `,
  styleUrls: ['./edge-value.component.css']
})
export class EdgeValueComponent {
  @Input() value: EdgeValue;

  typeString(value: EdgeValue): string {
    if (this.value instanceof TaggedValue) {
      return "tagged";
    } else if (this.value instanceof ListValue) {
      //console.log("LIST: " + value.toStringKey());
      return "list";
    }  else if (this.value instanceof MapValue) {
      return "map";
    } else {
      return "scalar";
    }
  }

  /*buildListFields(list: EdgeValue): any[] {
    console.log("LIST FIELDS CALL");
    if (list instanceof ListValue) {
      return list.value.sort((l, r) => l.toStringKey().localeCompare(r.toStringKey()))
    } else {
      return [];
    }
  }*/

  /*buildMapFields(map: EdgeValue): any[] {
    let results: {key: EdgeValue, value: EdgeValue}[] = [];
    if (map instanceof MapValue) {
      map.value.pairs().forEach(tup => {
        let key = tup[0];
        let value = tup[1];
        results.push({key: key, value: value});
      })
    }
    return results.sort((l, r) => l.key.toStringKey().localeCompare(r.key.toStringKey()));
  }*/
}
