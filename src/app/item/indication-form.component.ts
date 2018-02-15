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

import { Component, Input } from "@angular/core";
import { KeyState } from "../edge/edge-key-db";
import { EndpointPath } from "../edge/edge-model";
import { EdgeConsumerService } from "../edge-consumer.service";

@Component({
  selector: 'indication-form',
  template: `
    <button type="button" class="btn btn-default" (click)="issueIndication(state.key)">
      <span class="glyphicon glyphicon-circle-arrow-down" aria-hidden="true"></span>
    </button>
  `,
})
export class IndicationFormComponent {
  @Input() state: KeyState;

  constructor(private service: EdgeConsumerService) {}

  issueIndication(key: EndpointPath) {
    console.log("got:");
    console.log(key);
    this.service.issueOutputRequest(key);
  }
}
