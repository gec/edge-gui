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
import {EdgeConsumerService, TypedStates} from "./edge-consumer.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import {
  EndpointDescriptor,
  EndpointId,
  Path
} from "./edge/edge-model";
import { KeyState } from "./edge/edge-key-db";



@Component({
  selector: 'endpoint',
  templateUrl: './endpoint.component.html',
  //styleUrls: ['./endpoint.component.css']
})
export class EndpointComponent implements OnInit {
  pageState: string = "uninit";
  id: EndpointId = null;
  series: KeyState[];
  keyValues: KeyState[];
  events: KeyState[];
  activeSets: KeyState[];
  outputs: KeyState[];

  seq: number = 0;

  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location,) {}

  ngOnInit(): void {
    let typed = this.route.params.map((params: Params) => {
      let id = params['id'];
      console.log(id);
      console.log("seq: " + this.seq);
      this.seq += 1;
      this.pageState = "uninit";

      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      this.id = endId;
      this.pageState = "pending";
      return this.service.subscribeEndpointDescriptor(endId);
    }).switchMap((obj: EndpointDescriptor) => {
      this.pageState = "described";

      let [initial, dataUpdates] = this.service.typedTabular(this.id, obj);
      this.handleUpdates(initial);

      return dataUpdates;

      //return this.service.typedTabular(this.id, obj).delay(2000)
    });

    typed.forEach(v => {
      if (this.pageState === "described") {
        this.pageState = "subscribed";
      }

      this.handleUpdates(v);
    });
  }

  private handleUpdates(v: TypedStates) {

    let sortStates = (l: KeyState, r: KeyState) => {
      return l.key.toStringKey().localeCompare(r.key.toStringKey())
    };

    this.keyValues = v.keyValues.sort(sortStates);
    this.series = v.series.sort(sortStates);
    this.events = v.topicEvents.sort(sortStates);
    this.activeSets = v.activeSets.sort(sortStates);
    this.outputs = v.outputs.sort(sortStates);
  }
}

