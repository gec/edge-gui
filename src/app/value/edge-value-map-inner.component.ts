import {Component, Input} from "@angular/core";
import {
   EdgeValue, ListValue, MapValue, TaggedValue,
} from "../edge/edge-data";

@Component({
  selector: 'edge-value-map-inner',
  template: `
    <div>
      <ul>
        <li *ngFor="let field of fields">
          <span class="edge-value-field-key"><edge-value-field-name [value]="field[0]"></edge-value-field-name></span>
          <span> : </span>
          <edge-value [value]="field[1]"></edge-value>
        </li>
      </ul>
    </div>

  `,
  styles: [`    
    li {
      display: block;
      border: 0px;
    }
  `]
})
export class EdgeValueMapInnerComponent {
  @Input() fields: [EdgeValue, EdgeValue][];


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
