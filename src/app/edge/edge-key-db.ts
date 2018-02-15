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


import {
  ActiveSetValueDescriptor,
  DataKeyDescriptor, EndpointPath, EventTopicValueDescriptor, KeyDescriptor, LatestKeyValueDescriptor,
  OutputKeyDescriptor, Path, PathMap,
  TimeSeriesValueDescriptor
} from "./edge-model";
import { EdgeValue, IndexableValue, SampleValue } from "./edge-data";
import {
  ActiveSetUpdate,
  IdDataKeyUpdate, IdKeyUpdate, IdOutputKeyUpdate, KeyType, KeyValueUpdate, OutputKeyStatus, SeriesUpdate, StatusType,
  TopicEventUpdate
} from "./edge-consumer";
import { isNullOrUndefined } from "util";
import { EdmCore, OutputType, SeriesType } from "./edge-edm-core";
import NumberFormat = Intl.NumberFormat;


export interface SeriesValueMapper {
  transform(v: SampleValue): number | boolean | string | null
}

export class TimeSeriesValue {
  constructor(
    public readonly value: SampleValue,
    public readonly renderValue: boolean | number | string,
    public readonly unit: string,
    public readonly date: Date,
  ) {}
}

export class KeyValueValue {
  constructor(
    public readonly value: EdgeValue,
  ) {}
}

export class EventValueRecord {
  constructor(
    public readonly topic: Path,
    public readonly value: EdgeValue,
    public readonly time: Date,
  ) {}
}

export class EventValueArray {
  constructor(
    public readonly values: EventValueRecord[],
  ) {}
}

export class ActiveSetKv {
  constructor(
    public readonly key: IndexableValue,
    public readonly value: EdgeValue
  ) {}
}
export class ActiveSetValue {
  constructor(
    public readonly kvs: ActiveSetKv[],
  ) {}
}



type KeyValue = TimeSeriesValue | KeyValueValue | EventValueArray | ActiveSetValue | OutputStatusStateValue

export class KeyState {
  constructor(
    public readonly key: EndpointPath,
    public readonly status: StatusType,
    public readonly keyType: KeyType,
    public readonly value?: KeyValue,
  ) {}
}

export interface KeyDb {
  handle(update: IdKeyUpdate): void
  state(): KeyState
}

export class TimeSeriesDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
    desc: TimeSeriesValueDescriptor
  ) {
    this.processMetadata(metadata);
  }

  private status: StatusType = "PENDING";
  private seriesType: SeriesType = "analog_status";
  private unit: string = null;
  private currentValue?: TimeSeriesValue = null;
  private mapper?: SeriesValueMapper = null;
  private decimalPoints?: number = null;

  private processMetadata(metadata: PathMap<EdgeValue>) {
    this.seriesType = EdmCore.readSeriesType(metadata);
    if (this.seriesType === "boolean_status") {
      this.mapper = EdmCore.booleanValueMapper(metadata)
    } else if (this.seriesType === "integer_enum") {
      this.mapper = EdmCore.integerValueMapper(metadata)
    }

    this.unit = EdmCore.readUnit(metadata);

    this.decimalPoints = EdmCore.readDecimalPoints(metadata);
  }

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update instanceof IdDataKeyUpdate)) {
      let dataUpdate = update as IdDataKeyUpdate;
      if (!isNullOrUndefined(dataUpdate.value) && dataUpdate.value instanceof SeriesUpdate) {
        let up: SeriesUpdate = dataUpdate.value;
        if (!isNullOrUndefined(up.descriptorUpdate)) {
          this.processMetadata(up.descriptorUpdate.metadata);
        }

        let renderValue: boolean | number | string;
        if (this.seriesType === "analog_status" || this.seriesType === "analog_sample") {

          if (!isNullOrUndefined(this.decimalPoints)) {
            renderValue = (+up.value.value).toFixed(this.decimalPoints);
          } else {
            renderValue = up.value.value;
          }

        } else if (this.seriesType === "boolean_status" || this.seriesType === "integer_enum") {

          if (!isNullOrUndefined(this.mapper)) {
            let mapped = this.mapper.transform(up.value);
            if (!isNullOrUndefined(mapped)) {
              renderValue = mapped;
            } else {
              renderValue = up.value.value;
            }
          } else {
            renderValue = up.value.value;
          }

        } else if (this.seriesType ===  "counter_status" || this.seriesType === "counter_sample") {
          renderValue = up.value.value;
        }

        let date = new Date(up.time);

        this.currentValue = new TimeSeriesValue(up.value, renderValue, this.unit, date);
      }
    } else {
      this.currentValue = null;
    }
  }

  state(): KeyState {
    return new KeyState(this.key, this.status, "Series", this.currentValue);
  }
}

export class KeyValueDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
    desc: LatestKeyValueDescriptor
  ) {
    this.processMetadata(metadata);
  }

  private status: StatusType = "PENDING";
  private currentValue?: KeyValueValue = null;
  private cached: KeyState = new KeyState(this.key, this.status, "KeyValue", this.currentValue);

  private updateCache(): void {
    this.cached = new KeyState(this.key, this.status, "KeyValue", this.currentValue);
  }

  private processMetadata(metadata: PathMap<EdgeValue>) {
    //EdgeModelReader.seriesValueMapper(metadata)
  }

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update instanceof IdDataKeyUpdate)) {
      if (!isNullOrUndefined(update.value) && update.value instanceof KeyValueUpdate) {
        let up: KeyValueUpdate = update.value;
        if (!isNullOrUndefined(up.descriptorUpdate)) {
          this.processMetadata(up.descriptorUpdate.metadata);
        }

        if (!isNullOrUndefined(this.currentValue) && !isNullOrUndefined(this.currentValue.value) && up.value.toStringKey() !== this.currentValue.value.toStringKey()) {
          console.log("kv update: " + this.key.toStringKey());
        } else {
          console.log("kv no change: " + this.key.toStringKey());
        }

        this.currentValue = new KeyValueValue(up.value);
        this.updateCache();
      }
    } else {
      this.currentValue = null;
      this.updateCache();
    }
    // console.log("Updated time series jsValue: ");
    // console.log(this.state());
    // console.log(this.currentValue);
  }

  state(): KeyState {
    return this.cached;
  }
}

export class EventDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
    desc: TimeSeriesValueDescriptor
  ) {}

  private status: StatusType = "PENDING";
  private buffer: EventValueRecord[] = [];

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update instanceof IdDataKeyUpdate)) {
      if (!isNullOrUndefined(update.value) && update.value instanceof TopicEventUpdate) {
        let up: TopicEventUpdate = update.value;

        let date = new Date(up.time);
        let record = new EventValueRecord(up.topic, up.value, date);

        this.buffer.push(record);
        if (this.buffer.length > 100) {
          this.buffer.shift();
        }
      }
    }
  }

  state(): KeyState {
    return new KeyState(this.key, this.status, "TopicEvent", new EventValueArray(this.buffer));
  }
}

export class ActiveSetValueDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
    desc: ActiveSetValueDescriptor
  ) {
    this.processMetadata(metadata);
  }

  private status: StatusType = "PENDING";
  private currentValue?: ActiveSetValue = null;
  private cached: KeyState = new KeyState(this.key, this.status, "ActiveSet", this.currentValue);


  private processMetadata(metadata: PathMap<EdgeValue>) {
    //EdgeModelReader.seriesValueMapper(metadata)
  }

  private updateCache(): void {
    this.cached = new KeyState(this.key, this.status, "KeyValue", this.currentValue);
  }

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update instanceof IdDataKeyUpdate)) {
      if (!isNullOrUndefined(update.value) && update.value instanceof ActiveSetUpdate) {
        let up = update.value;
        if (!isNullOrUndefined(up.descriptorUpdate)) {
          this.processMetadata(up.descriptorUpdate.metadata);
        }

        let kvs: ActiveSetKv[] = [];
        up.value.forEach((v, k) => {
          kvs.push(new ActiveSetKv(k, v));
        });

        this.currentValue = new ActiveSetValue(kvs.sort((l, r) => l.key.toStringKey().localeCompare(r.key.toStringKey())))
        this.updateCache();
      }
    } else {
      this.currentValue = null;
      this.updateCache();
    }
  }

  state(): KeyState {
    return this.cached;
  }
}

export class OutputStatusStateValue {
  constructor(
    public readonly outputStatus: OutputKeyStatus | null,
    public readonly outputType: OutputType,
    public readonly requestScale: number | null,
    public readonly requestOffset: number | null,
    public readonly integerLabels: [string, number][] | null,
  ) {}
}

export class OutputKeyDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
  ) {
    this.processMetadata(metadata);
    this.current = new OutputStatusStateValue(null, this.outputType, this.requestScale, this.requestOffset, this.integerLabels)
  }

  private status: StatusType = "PENDING";
  private current?: OutputStatusStateValue = null;
  private outputType: OutputType = "simple_indication";
  private requestScale?: number = null;
  private requestOffset?: number = null;
  private integerLabels?: [string, number][] = null;

  private processMetadata(metadata: PathMap<EdgeValue>) {
    this.outputType = EdmCore.readOutputType(metadata);
    this.requestScale = EdmCore.readRequestScale(metadata);
    this.requestOffset = EdmCore.readRequestOffset(metadata);
    this.integerLabels = EdmCore.readRequestIntegerLabels(metadata);
  }

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && update instanceof IdOutputKeyUpdate) {
      this.status = update.statusType;

      if (!isNullOrUndefined(update.value)) {
        this.current = new OutputStatusStateValue(update.value.statusUpdate, this.outputType, this.requestScale, this.requestOffset, this.integerLabels)
      }
    }
  }

  state(): KeyState {
    return new KeyState(this.key, this.status, "OutputStatus", this.current);
  }
}

export class EdgeKeyTable {

  constructor(keys: [EndpointPath, KeyDescriptor][]) {
    console.log("Creating table: ");
    console.log(keys);
    keys.forEach(tup => {
      let id = tup[0];
      let keyDesc = tup[1];
      if (keyDesc instanceof DataKeyDescriptor) {
        if (keyDesc.typeDescriptor instanceof TimeSeriesValueDescriptor) {
          let db = new TimeSeriesDb(id, keyDesc.metadata, keyDesc.typeDescriptor);
          this.map.set(id.toStringKey(), db);
        } else if (keyDesc.typeDescriptor instanceof LatestKeyValueDescriptor) {
          let db = new KeyValueDb(id, keyDesc.metadata, keyDesc.typeDescriptor);
          this.map.set(id.toStringKey(), db);
        } else if (keyDesc.typeDescriptor instanceof EventTopicValueDescriptor) {
          let db = new EventDb(id, keyDesc.metadata, keyDesc.typeDescriptor);
          this.map.set(id.toStringKey(), db);
        } else if (keyDesc.typeDescriptor instanceof ActiveSetValueDescriptor) {
          let db = new ActiveSetValueDb(id, keyDesc.metadata, keyDesc.typeDescriptor);
          this.map.set(id.toStringKey(), db);
        }
      } else if (keyDesc instanceof OutputKeyDescriptor) {
        let db = new OutputKeyDb(id, keyDesc.metadata);
        this.map.set(id.toStringKey(), db)
      }
    });
    this.updateCache();
  }

  private map = new Map<string, KeyDb>();
  private cached: KeyState[] = [];

  snapshot(): KeyState[] {
    return this.cached;
  }

  updateCache(): void {
    let result = [];
    this.map.forEach(v => {
      result.push(v.state());
    });
    this.cached = result;
  }

  handle(updates: IdKeyUpdate[]): void {
    let dirty = false;
    updates.forEach(v => {
      let up = v;
      let db = this.map.get(up.id.toStringKey());
      //console.log(db);
      if (!isNullOrUndefined(db)) {
        db.handle(up);
        dirty = true;
      }
    });
    if (dirty) {
      this.updateCache();
    }
  }

  isActive(): boolean {
    return this.map.size > 0;
  }
}
