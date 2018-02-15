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


import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Data, Params } from "@angular/router";
import { EdgeConsumerService } from "./edge-consumer.service";
import {
  ActiveSetValueDescriptor,
  EndpointDescriptor, EndpointId, EventTopicValueDescriptor, LatestKeyValueDescriptor, Path, PathMap,
  TimeSeriesValueDescriptor,
  TypeDescriptor
} from "./edge/edge-model";
import { DataKeyRecord, PathValueRecord, OutputKeyRecord } from "./record/descriptor-records";
import { EdgeValue } from "./edge/edge-data";

@Component({
  selector: 'endpoint-desc',
  templateUrl: './endpoint-desc.component.html',
  //styleUrls: ['./endpoint.component.css']
})
export class EndpointDescComponent implements OnInit {
  id: EndpointId = null;
  desc: EndpointDescriptor = null;

  endpointMetadata: PathValueRecord[];
  dataKeys: DataKeyRecord[];
  outputKeys: OutputKeyRecord[];



  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location) {}

  ngOnInit(): void {
    let endpointDescObs = this.route.params.map((params: Params) => {
      let id = params['id'];
      console.log(id);
      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      this.id = endId;
      return this.service.subscribeEndpointDescriptor(endId);
    }).forEach(ed => {
      console.log(ed);
      this.desc = ed;

      this.endpointMetadata = EndpointDescComponent.metadataRecords(ed.metadata);

      this.dataKeys = ed.dataKeySet.items().map(item => {

        let metadata = EndpointDescComponent.metadataRecords(item.item.metadata);

        return new DataKeyRecord(item.path, metadata, EndpointDescComponent.typeDescriptorName(item.item.typeDescriptor))

      }).sort((l, r) => l.path.toStringKey().localeCompare(r.path.toStringKey()));


      this.outputKeys = ed.outputKeySet.items().map(item => {

        let metadata = EndpointDescComponent.metadataRecords(item.item.metadata);

        return new OutputKeyRecord(item.path, metadata)

      }).sort((l, r) => l.path.toStringKey().localeCompare(r.path.toStringKey()));;

    })
  }

  static metadataRecords(map: PathMap<EdgeValue>): PathValueRecord[] {
    return map.items()
      .map(item => new PathValueRecord(item.path, item.item))
      .sort((l, r) => {
        return l.path.toStringKey().localeCompare(r.path.toStringKey())
      });
  }

  static typeDescriptorName(td: TypeDescriptor): string {
    if (td instanceof LatestKeyValueDescriptor) {
      return "Key Value";
    } else if (td instanceof TimeSeriesValueDescriptor) {
      return "Time Series";
    } else if (td instanceof EventTopicValueDescriptor) {
      return "Event";
    } else if (td instanceof ActiveSetValueDescriptor) {
      return "Active Set";
    } else {
      return "Unknown";
    }
    //LatestKeyValueDescriptor | TimeSeriesValueDescriptor | EventTopicValueDescriptor | ActiveSetValueDescriptor
  }
}

