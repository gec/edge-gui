import { Component, OnInit } from '@angular/core';
import { EdgeConsumerService } from "./edge-consumer.service";
import { EndpointId, Path } from "./edge/edge-model";
import {isNullOrUndefined} from "util";
import {StatusType} from "./edge/edge-consumer";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  endpoints: EndpointId[] = [];
  statusType: StatusType = "PENDING";

  constructor(private service: EdgeConsumerService) {}

  ngOnInit(): void {
    this.service.subscribePrefixes([new Path([])])
      .forEach(updates => {
        if (updates.length > 0) {
          let last = updates[updates.length - 1];
          console.log("endpoint prefix result: ");
          console.log(last);
          this.statusType = last.type;
          if (!isNullOrUndefined(last.value)) {
            this.endpoints = last.value.value;
          } else {
            this.endpoints = [];
          }
        }
    })
  }

  toKeyString(path: Path): String {
    return Path.toStringKey(path);
  }
}
