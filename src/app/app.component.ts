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
  inputHost: string = "127.0.0.1";
  inputPort: number = 8080;
  inputSsl: boolean = false;

  host: string = "127.0.0.1";
  port: number = 8080;
  ssl: boolean = false;

  endpoints: EndpointId[] = [];
  statusType: StatusType = "PENDING";

  constructor(private service: EdgeConsumerService) {}

  setUri() {
    let uri: string = "";
    if (this.ssl) {
      uri += "wss://"
    } else {
      uri += "ws://"
    }
    uri += this.host;
    uri += ":";
    uri += this.port;
    uri += "/socket";
    console.log("uri: " + uri);
    this.service.setUri(uri);
  }

  addressApply() {
    console.log("APPLIED: " + this.inputHost + ", " + this.inputPort + ", " + this.inputSsl);
    this.host = this.inputHost;
    this.port = this.inputPort;
    this.ssl = this.inputSsl;
    this.setUri();
  }
  addressCancel() {
    console.log("CANCELED");
    this.inputHost = this.host;
    this.inputPort = this.port
    this.inputSsl = this.ssl;
  }

  ngOnInit(): void {
    this.setUri();
    this.service.subscribePrefixes([new Path([])])
      .forEach(updates => {
        if (updates.length > 0) {
          let last = updates[updates.length - 1];
          console.log("endpoint prefix result: ");
          console.log(last);
          this.statusType = last.type;
          if (!isNullOrUndefined(last.value)) {
            this.endpoints = last.value.value.sort((l, r) => l.toStringKey().localeCompare(r.toStringKey()));
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
