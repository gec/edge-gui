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

import { Observable } from "rxjs/Rx";
import { EdgeDataParser, EdgeValue } from "./edge-data"
import { EndpointDescriptor, EndpointId, Path, EdgeModelParser, EndpointPath } from "./edge-model";
import { EdgeConsumer, IdKeyUpdate, StatusType } from "./edge-consumer";
import { isNullOrUndefined } from "util";


interface SubscriptionExtractor {
  handle(updates: any): void
}

class EndpointPrefixSubExtractor implements SubscriptionExtractor {
  constructor(private callback: (updates: any) => void) {}

  handle(updates: any): void {
    let typedUpdates = updates.reduce((accum, v) => {
      if (v.endpointPrefixUpdate) {
        accum.push(v.endpointPrefixUpdate)
      }
      return accum;
    }, []);

    let parsed = EdgeConsumer.parseEndpointPrefixUpdates(typedUpdates);

    if (parsed.length > 0) {
      this.callback(parsed);
    }
  }
}

class EndpointDescSubExtractor implements SubscriptionExtractor {
  constructor(private id: EndpointId, private callback: (updates: EndpointDescriptor) => void) {}

  handle(updates: any[]): void {

    if (updates.length > 0) {
      let last = updates[updates.length - 1];
      if (last.endpointUpdate) {
        let update  = last.endpointUpdate;
        if (update.value) {
          let desc = EdgeModelParser.parseEndpointDescriptor(update.value);
          if (desc) {
            this.callback(desc);
          }
        }
      }
    }
  }
}

class KeyUpdateExtractor implements SubscriptionExtractor {
  constructor(
    private callback: (updates: IdKeyUpdate[]) => void,
  ) {}


  handle(updates: any): void {
    let results = EdgeConsumer.parseUpdates(updates);
    if (results.length > 0) {
      this.callback(results);
    }
  }
}

class Subscription {
  id: number;
  params: any;
  extractor: SubscriptionExtractor;
}

export class EdgeSubscriptionHandle {

  constructor(private doClose: () => void) {}

  close() {
    this.doClose()
  }
}

export class EdgeWebSocketService {

  private uri: string = null;
  private socket: WebSocket = null;
  private seq: number = 0;
  private outputSeq: number = 0;
  private subscriptionMap = new Map<number, Subscription>();

  private getSeq(): number {
    let result = this.seq;
    this.seq += 1;
    return result;
  }
  private getOutputSeq(): number {
    let result = this.outputSeq;
    this.outputSeq += 1;
    return result;
  }

  constructor() {}

  setUri(uri: string): void {
    console.log("uri: " + this.uri);
    if (this.socket != null) {
      this.socket.close();
    }
    this.uri = uri;
    this.doConnect()
  }

  start(): void {
    this.check();
    Observable.interval(2000).subscribe(() => {
      this.check();
    })
  }

  private check(): void {
    if (this.socket == null && this.uri != null) {
      this.doConnect();
    }
  }

  private removeSubscription(id: number): void {
    console.log("Removing sub: " + id);
    this.subscriptionMap.delete(id);
    if (this.socket != null) {
      let msg = {
        subscriptions_removed : [id]
      };
      this.socket.send(JSON.stringify(msg))
    }
  }

  private addSubscription(id: number, record: Subscription): void {
    console.log("Adding sub: " + id);
    this.subscriptionMap.set(id, record);
    if (this.socket != null) {
      let subMap = {};
      subMap[id] = record.params;
      let msg = {
        subscriptions_added : subMap
      };
      this.socket.send(JSON.stringify(msg))
    }
  }

  private subscribe(extractor: SubscriptionExtractor, params: any): EdgeSubscriptionHandle {
    let subSeq = this.getSeq();

    let subRecord: Subscription = { id: subSeq, params: params, extractor: extractor }

    this.addSubscription(subSeq, subRecord);

    return new EdgeSubscriptionHandle(() => {
      this.removeSubscription(subSeq)
    });
  }


  issueOutputRequest(key: EndpointPath, value?: EdgeValue) {
    let seq = this.getOutputSeq();

    let request = {};
    if (!isNullOrUndefined(value)) {
      request = { output_value : EdgeDataParser.writeValue(value) }
    }

    let msg = {
      output_requests: [
        {
          id: key,
          request: request,
          correlation: seq,
        }
      ]
    };

    let json = JSON.stringify(msg);
    this.socket.send(json);
  }

  subscribePrefixes(paths: Path[], callback: (updates: any) => void): EdgeSubscriptionHandle {

    let extractor = new EndpointPrefixSubExtractor(callback);

    let params = {
      endpoint_prefix_set: paths
    };

    return this.subscribe(extractor, params);
  }

  subscribeEndpointDescriptor(id: EndpointId, callback: (updates: EndpointDescriptor) => void): EdgeSubscriptionHandle {

    let extractor = new EndpointDescSubExtractor(id, callback);

    let params = {
      endpoint_descriptors: [id]
    };

    return this.subscribe(extractor, params);
  }

  subscribeDataKeys(params: any, callback: (updates: IdKeyUpdate[]) => void): EdgeSubscriptionHandle {

    let extractor = new KeyUpdateExtractor(callback);

    return this.subscribe(extractor, params);
  }


  private onOpen(): void {


    if (this.subscriptionMap.size > 0) {
      let subObj = {};

      this.subscriptionMap.forEach((value, key) => {
        subObj[key] = value.params;
      });

      //console.log("SUB OBJ:");
      //console.log(subObj);

      let msg = {
        subscriptions_added: subObj
      };

      this.socket.send(JSON.stringify(msg));
    }
  }

  private doConnect(): void {
    let ws: WebSocket = new WebSocket(this.uri);

    ws.onopen = () => {
      console.log("Socket has been opened!");
      this.socket = ws;

      this.onOpen();
    };

    ws.onmessage = (message) => {

      let parsed = JSON.parse(message.data);
      // console.log("JSON: " + parsed);
      // console.log(parsed);

      if (!isNullOrUndefined(parsed.subscriptionNotification)) {
        for (let objKey in parsed.subscriptionNotification) {
          //console.log(objKey);
          let updateSet = parsed.subscriptionNotification[objKey];
          let subKey = +objKey;

          let subRecord = this.subscriptionMap.get(subKey);
          if (subRecord && updateSet && updateSet.updates) {
            subRecord.extractor.handle(updateSet.updates);
          }
        }
      }

      if (!isNullOrUndefined(parsed.output_responses)) {
        console.log("GOT OUTPUT RESPONSES:");
        console.log(parsed.output_responses);
      }
    };

    ws.onerror = (err) => {
      console.log("error: " + err);

    };
    ws.onclose = (ev) => {
      console.log("onclose: " + ev);
      this.socket = null;
    };
  }

}
