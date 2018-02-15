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
