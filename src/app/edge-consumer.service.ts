
import { Injectable, OnInit } from "@angular/core";
import { EdgeWebSocketService, IdEndpointPrefixUpdate } from "./edge/webmodule";
import { Observable } from "rxjs/Observable";
import { EndpointId, Path } from "./edge/edge-model";


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

  subscribeEndpointDescriptor(id: EndpointId): Observable<any> {
    this.checkStart();

    let obs = Observable.create(observer => {
      let sub = this.service.subscribeEndpointDescriptor(id, updates => {
        observer.next(updates)
      });
      return () => { sub.close() };
    });

    return obs;
  }



}
/*

var endpointDescriptorSubscription = function(endId, handler) {

  var dataMap = {};

  var infoParams = {
    descriptors: [ endId ]
  };
  console.log("Subscribing descriptor: " + endId);
  console.log(infoParams);
  var infoSub = connectionService.subscribe(infoParams, function(msg) {
    console.log("endpointDescriptorSubscription got info: ");
    console.log(msg);

    var dataObjects = [];
    var outputObjects = [];
    var descResult = null;

    msg.updates.filter(function(v) { return v.endpointUpdate != null })
      .map(function(v) { return v.endpointUpdate })
      .forEach(function(update) {
        console.log(update);
        var endId = update.id;
        var descriptor = update.value;
        if (descriptor != null && endId != null) {

          descResult = endpointInfo(endId, descriptor);

          if (descriptor.dataKeySet != null) {
            descriptor.dataKeySet.forEach(function(elem) {
              console.log("ELEM:");
              console.log(elem);

              var pathStr = pathToString(elem.key);
              var db = null;
              var existing = dataMap[pathStr];
              if (existing != null && existing.value != null) {
                db = existing.value
              }

              //var dataObject = function(endpointId, key, desc, dbParam)
              var data = dataObject(endId, elem.key, elem.value, db);
              dataObjects.push(data)
            });
          }
          if (descriptor.outputKeySet != null) {
            descriptor.outputKeySet.forEach(function(elem) {
              console.log("OutELEM:");
              console.log(elem);

              var output = outputObject(endId, elem.key, elem.value);
              outputObjects.push(output)
            });
          }
        }
      });

    handler({
      descriptor: descResult,
      data: dataObjects,
      output: outputObjects
    });
  });

  return infoSub;
};*/
