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

import { EdgeValue } from "../edge/edge-data";
import { Path } from "../edge/edge-model";

export class PathValueRecord {
  constructor(
    public readonly path: Path,
    public readonly value: EdgeValue,
  ) {}
}

export class DataKeyRecord {
  constructor(
    public readonly path: Path,
    public readonly metadata: PathValueRecord[],
    public readonly type: String,
  ) {}
}
export class OutputKeyRecord {
  constructor(
    public readonly path: Path,
    public readonly metadata: PathValueRecord[]
  ) {}
}
