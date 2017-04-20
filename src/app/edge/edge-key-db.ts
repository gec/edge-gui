

import {
  DataKeyDescriptor, EndpointPath, EventTopicValueDescriptor, KeyDescriptor, LatestKeyValueDescriptor,
  OutputKeyDescriptor, Path, PathMap,
  TimeSeriesValueDescriptor
} from "./edge-model";
import { EdgeValue, SampleValue } from "./edge-data";
import {
  IdDataKeyUpdate, IdKeyUpdate, IdOutputKeyUpdate, KeyType, KeyValueUpdate, OutputKeyStatus, SeriesUpdate, StatusType,
  TopicEventUpdate
} from "./edge-consumer";
import { isNullOrUndefined } from "util";
import { EdmCore, SeriesType } from "./edge-edm-core";
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

export class OutputStatusStateValue {
  constructor(
    public readonly outputStats: OutputKeyStatus,
  ) {}
}

type KeyValue = TimeSeriesValue | KeyValueValue | EventValueArray | OutputStatusStateValue

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

        this.currentValue = new KeyValueValue(up.value);
      }
    } else {
      this.currentValue = null;
    }
    // console.log("Updated time series jsValue: ");
    // console.log(this.state());
    // console.log(this.currentValue);
  }

  state(): KeyState {
    return new KeyState(this.key, this.status, "KeyValue", this.currentValue);
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

export class OutputKeyDb implements KeyDb {
  constructor(
    private key: EndpointPath,
    metadata: PathMap<EdgeValue>,
  ) {}

  private status: StatusType = "PENDING";
  private current?: OutputStatusStateValue = null;

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update.constructor === IdOutputKeyUpdate)) {
      let outputUpdate = update as IdOutputKeyUpdate;

      this.status = outputUpdate.statusType;

      if (!isNullOrUndefined(outputUpdate.value)) {
        this.current = new OutputStatusStateValue(outputUpdate.value.statusUpdate)
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
          let desc = keyDesc.typeDescriptor;
          let db = new TimeSeriesDb(id, keyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        } else if (keyDesc.typeDescriptor instanceof LatestKeyValueDescriptor) {
          let desc = keyDesc.typeDescriptor;
          let db = new KeyValueDb(id, keyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        } else if (keyDesc.typeDescriptor instanceof EventTopicValueDescriptor) {
          let desc = keyDesc.typeDescriptor;
          let db = new EventDb(id, keyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        }
      } else if (keyDesc instanceof OutputKeyDescriptor) {
        let db = new OutputKeyDb(id, keyDesc.metadata);
        this.map.set(id.toStringKey(), db)
      }
    });
  }

  private map = new Map<string, KeyDb>();

  snapshot(): KeyState[] {
    let result = [];
    this.map.forEach(v => {
      result.push(v.state());
    });
    return result;
  }

  handle(updates: IdKeyUpdate[]): void {
    updates.forEach(v => {
      if (v instanceof IdDataKeyUpdate) {
        let up = v;
        let db = this.map.get(up.id.toStringKey());
        //console.log(db);
        if (!isNullOrUndefined(db)) {
          db.handle(up);
        }
      }
    })
  }

  isActive(): boolean {
    return this.map.size > 0;
  }
}
