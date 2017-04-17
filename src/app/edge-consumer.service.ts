
import { Injectable, OnInit } from "@angular/core";
import { EdgeWebSocketService, IdEndpointPrefixUpdate } from "./edge/webmodule";
import { Observable } from "rxjs/Observable";
import {
  ActiveSetValueDescriptor,
  DataKeyDescriptor, EndpointDescriptor, EndpointId, EndpointPath, EventTopicValueDescriptor, KeyDescriptor,
  LatestKeyValueDescriptor,
  OutputKeyDescriptor, Path,
  TimeSeriesValueDescriptor
} from "./edge/edge-model";
import { EdgeConsumer, IdKeyUpdate } from "./edge/edge-consumer";
import { EdgeKeyTable, KeyState } from "./edge/edge-key-db";
import { isNullOrUndefined } from "util";


@Injectable()
export class EdgeConsumerService {

  private started = false;
  private service = new EdgeWebSocketService("ws://127.0.0.1:8080/socket");

  private checkStart() {
    if (!this.started) {
      this.service.start();
      this.started = true;
    }
  }


  /*ngOnInit(): void {
    this.service.start();
  }*/

  subscribePrefixes(prefixes: Path[]): Observable<IdEndpointPrefixUpdate[]> {
    this.checkStart();
    //this.service.subscribePrefixes(prefixes, updates => { console.log(updates) });

    //let obs = Observable.bindCallback(this.service.subscribePrefixes)

    let obs = Observable.create(observer => {
      let sub = this.service.subscribePrefixes(prefixes, updates => {
        observer.next(updates)
      });
      return () => { sub.close() };
    });

    return obs;
  }

  subscribeEndpointDescriptor(id: EndpointId): Observable<EndpointDescriptor> {
    this.checkStart();

    let obs = Observable.create(observer => {
      let sub = this.service.subscribeEndpointDescriptor(id, updates => {
        observer.next(updates)
      });
      return () => { sub.close() };
    });

    return obs;
  }

  subscribeEndpointKeys(id: EndpointId, descriptor: EndpointDescriptor): Observable<IdKeyUpdate[]> {
    this.checkStart();

    let params = EdgeConsumer.subscriptionParamsForKeys(id, descriptor);

    let obs = Observable.create(observer => {
      let sub = this.service.subscribeDataKeys(params, updates => {
        observer.next(updates)
      });
      return () => { sub.close() };
    });

    return obs;
  }


  typedTabular(id: EndpointId, descriptor: EndpointDescriptor): Observable<TypedStates> {
    this.checkStart();

    //let tables = new Map<String, EdgeKeyTable>();

    let seriesDescs: [EndpointPath, KeyDescriptor][] = [];
    let keyValueDescs: [EndpointPath, KeyDescriptor][] = [];
    let topicEventDescs: [EndpointPath, KeyDescriptor][] = [];
    let activeSetDescs: [EndpointPath, KeyDescriptor][] = [];
    let outputDescs: [EndpointPath, KeyDescriptor][] = [];

    descriptor.dataKeySet.forEach((v, keyPath) => {
      let endPath = new EndpointPath(id, keyPath);

      if (v.constructor === DataKeyDescriptor) {
        let dataKeyDesc = v as DataKeyDescriptor;
        if (dataKeyDesc.typeDescriptor.constructor === TimeSeriesValueDescriptor) {
          seriesDescs.push([endPath, dataKeyDesc]);
        } else if (dataKeyDesc.typeDescriptor.constructor === LatestKeyValueDescriptor) {
          keyValueDescs.push([endPath, dataKeyDesc]);
        } else if (dataKeyDesc.typeDescriptor.constructor === EventTopicValueDescriptor) {
          topicEventDescs.push([endPath, dataKeyDesc]);
        } else if (dataKeyDesc.typeDescriptor.constructor === ActiveSetValueDescriptor) {
          activeSetDescs.push([endPath, dataKeyDesc]);
        }
      } else if (v.constructor === OutputKeyDescriptor) {
        let desc = v as OutputKeyDescriptor;
        outputDescs.push([endPath, desc])
      }
    });

    let seriesTable = new EdgeKeyTable(seriesDescs);
    let keyValueTable = new EdgeKeyTable(keyValueDescs);
    let topicEventTable = new EdgeKeyTable(topicEventDescs);
    let activeSetTable = new EdgeKeyTable(activeSetDescs);
    let outputTable = new EdgeKeyTable(outputDescs);

    let tableMap = new Map<String, EdgeKeyTable>();
    seriesDescs.forEach(v => tableMap.set(v[0].toStringKey(), seriesTable));
    keyValueDescs.forEach(v => tableMap.set(v[0].toStringKey(), keyValueTable));
    topicEventDescs.forEach(v => tableMap.set(v[0].toStringKey(), topicEventTable));
    activeSetDescs.forEach(v => tableMap.set(v[0].toStringKey(), activeSetTable));
    outputDescs.forEach(v => tableMap.set(v[0].toStringKey(), outputTable));

    let getState = () => {
      return new TypedStates(seriesTable.snapshot(), keyValueTable.snapshot(), topicEventTable.snapshot(), activeSetTable.snapshot(), outputTable.snapshot())
    };

    let handle = (updates: IdKeyUpdate[]) => {
      updates.forEach(up => {
        let table = tableMap.get(up.id.toStringKey())
        if (!isNullOrUndefined(table)) {
          table.handle([up]);
        }
      });

      return getState();
    };

    // TODO: subscribe by [EndpointPath, KeyDescriptor][]
    // TODO: original, pending update

    return this.subscribeEndpointKeys(id, descriptor).map(v => handle(v));

    /*console.log("going to return???");
    return Observable.create(obs => {
      console.log("Creating???");
      obs.next(getState())
      return () => {};
    }).switch(this.subscribeEndpointKeys(id, descriptor))
      .map(keyUpdates => {
        console.log("GOT KEY UPDATES: ");
        console.log(keyUpdates);
        return handle(keyUpdates);
      });*/
  }
}

export class TypedStates {
  constructor(
    public readonly series: KeyState[],
    public readonly keyValues: KeyState[],
    public readonly topicEvents: KeyState[],
    public readonly activeSets: KeyState[],
    public readonly outputs: KeyState[],
  ) {}
}
