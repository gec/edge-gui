/**
 * Copyright 2011-2018 Green Energy Corp.
 *
 * Licensed to Green Energy Corp (www.greenenergycorp.com) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. Green Energy
 * Corp licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
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
