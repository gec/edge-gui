

import { EdgeDataParser, EdgeValue, IndexableValue, SampleValue } from "./edge-data";
import {
  ActiveSetValueDescriptor,
  DataKeyDescriptor, DataKeyTypes, EdgeModelParser, EndpointDescriptor, EndpointId, EndpointPath,
  EventTopicValueDescriptor,
  LatestKeyValueDescriptor,
  OutputKeyDescriptor, Path,
  TimeSeriesValueDescriptor,
  TypeDescriptor
} from "./edge-model";
import { ValueProvider } from "@angular/core";
import { isNullOrUndefined } from "util";


export enum StatusType {
  PENDING = 0,
  DATA_UNRESOLVED = 1,
  RESOLVED_ABSENT = 2,
  RESOLVED_VALUE = 3,
  DISCONNECTED = 4,
}

enum DataKeyUpdateType {
  Series,
  KeyValue,
  TopicEvent,
  ActiveSet,
}

interface DataKeyValueUpdate {
  updateType(): DataKeyUpdateType
  readonly descriptorUpdate?: DataKeyDescriptor;
}

export class SeriesUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly value: SampleValue,
    public readonly time: number,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.Series;
  }
}
export class KeyValueUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly value: EdgeValue,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.KeyValue;
  }
}
export class TopicEventUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly topic: Path,
    public readonly value: EdgeValue,
    public readonly time: number,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.TopicEvent;
  }
}
export class ActiveSetUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly value: Map<IndexableValue, EdgeValue>,
    public readonly removes: IndexableValue[],
    public readonly adds: Map<IndexableValue, EdgeValue>,
    public readonly modifies: Map<IndexableValue, EdgeValue>,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.ActiveSet;
  }
}

//export type DataKeyValueUpdate = SeriesUpdate | KeyValueUpdate | TopicEventUpdate | ActiveSetUpdate

enum IdUpdateType {
  DataKey,
  OutputKey
}

export interface IdKeyUpdate {
  getType(): IdUpdateType
  readonly id: EndpointPath
  readonly statusType: StatusType
}

export class IdDataKeyUpdate implements IdKeyUpdate {
  constructor(
    public readonly id: EndpointPath,
    public readonly statusType: StatusType,
    public readonly value?: DataKeyValueUpdate,
  ) {}

  getType(): IdUpdateType {
    return IdUpdateType.DataKey;
  }
}

export class UUID {
  constructor(public readonly value: String) {}
}

export class OutputKeyStatus {
  constructor(
    public readonly sequenceSession: UUID,
    public readonly sequence: number,
    public readonly value: EdgeValue,
  ) {}
}

export class OutputKeyUpdate {
  constructor(
    public readonly statusUpdate: OutputKeyStatus,
    public readonly descriptorUpdate?: OutputKeyDescriptor,
  ) {}
}


export class IdOutputKeyUpdate implements IdKeyUpdate {
  constructor(
    public readonly id: EndpointPath,
    public readonly statusType: StatusType,
    public readonly value?: OutputKeyUpdate,
  ) {}

  getType(): IdUpdateType {
    return IdUpdateType.OutputKey;
  }
}


export class EdgeConsumer {

  static subscriptionParamsForKeys(endpointId: EndpointId, descriptor: EndpointDescriptor): any {

    let series: EndpointPath[] = [];
    let keyValues: EndpointPath[] = [];
    let topicEvents: EndpointPath[] = [];
    let activeSets: EndpointPath[] = [];

    let outputs: EndpointPath[] = [];

    descriptor.dataKeySet.forEach((desc, key: Path) => {
      switch (desc.typeDescriptor.constructor) {
        case TimeSeriesValueDescriptor: series.push(new EndpointPath(endpointId, key)); break;
        case LatestKeyValueDescriptor: keyValues.push(new EndpointPath(endpointId, key)); break;
        case EventTopicValueDescriptor: topicEvents.push(new EndpointPath(endpointId, key)); break;
        case ActiveSetValueDescriptor: activeSets.push(new EndpointPath(endpointId, key)); break;
      }
    });
    descriptor.outputKeySet.forEach((desc, key) => {
      outputs.push(new EndpointPath(endpointId, key))
    });


    return {
      data_params: {
        series: series,
        key_values: keyValues,
        topic_events: topicEvents,
        active_sets: activeSets
      },
      output_keys: outputs,
    };
  }

  static parseMapKeyPairSet(pjson: any): Map<IndexableValue, EdgeValue> {
    let result = new Map<IndexableValue, EdgeValue>();

    if (!isNullOrUndefined(pjson) && pjson.forEach) {
      pjson.forEach(v => {
        if (!isNullOrUndefined(v.key) && !isNullOrUndefined(v.value)) {
          let k = EdgeDataParser.parseIndexableValue(v.key);
          let pv = EdgeDataParser.parseValue(v.value);
          if (!isNullOrUndefined(k) && !isNullOrUndefined(pv)) {
            result.set(k, pv);
          }
        }
      })
    }

    return result;
  }

  static parseUpdateValue(pjson: any): DataKeyValueUpdate {

    let desc: DataKeyDescriptor | null = null;
    if (!isNullOrUndefined(pjson.descriptorUpdate)) {
      desc = EdgeModelParser.parseDataKeyDescriptor(pjson.descriptorUpdate);
    }

    if (!isNullOrUndefined(pjson.seriesUpdate)) {
      let up = pjson.seriesUpdate;
      if (!isNullOrUndefined(up.value) && !isNullOrUndefined(up.time)) {
        let v = EdgeDataParser.parseSampleValue(up.value);
        let t = +up.time;
        if (!isNullOrUndefined(v) && !isNullOrUndefined(t)) {
          return new SeriesUpdate(v, t, desc);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (!isNullOrUndefined(pjson.keyValueUpdate)) {
      let up = pjson.keyValueUpdate;
      if (!isNullOrUndefined(up.value)) {
        let v = EdgeDataParser.parseValue(up.value);
        if (!isNullOrUndefined(v)) {
          return new KeyValueUpdate(v, desc);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (!isNullOrUndefined(pjson.topicEventUpdate)) {
      let up = pjson.topicEventUpdate;
      if (!isNullOrUndefined(up.topic) && !isNullOrUndefined(up.value) && !isNullOrUndefined(up.time)) {
        let topic = EdgeModelParser.parsePath(up.topic);
        let v = EdgeDataParser.parseValue(up.value);
        let t = +up.time;
        if (!isNullOrUndefined(topic) && !isNullOrUndefined(v) && !isNullOrUndefined(t)) {
          return new TopicEventUpdate(topic, v, t, desc);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (!isNullOrUndefined(pjson.activeSetUpdate)) {
      let up = pjson.activeSetUpdate;
      let curr = this.parseMapKeyPairSet(up.value);

      let removes: IndexableValue[] | null = []
      if (up.removes && up.removes.forEach) {
        up.removes.forEach(v => {
          let result = EdgeDataParser.parseIndexableValue(v);
          if (result) {
            removes.push(result);
          }
        })
      }

      let adds = this.parseMapKeyPairSet(up.adds);
      let modifies = this.parseMapKeyPairSet(up.modifies);

      return new ActiveSetUpdate(curr, removes, adds, modifies, desc);
    } else {
      return null;
    }
  }

  static parseUpdates(updates: any): IdKeyUpdate[] {

    let result: IdKeyUpdate[] = [];

    updates.forEach(v => {
      if (!isNullOrUndefined(v.dataKeyUpdate)) {
        let update = v.dataKeyUpdate;

        if (!isNullOrUndefined(update.id) && !isNullOrUndefined(update.type) && typeof update.type === 'string') {
          let id = EdgeModelParser.parseEndpointPath(update.id);
          let type = update.type;
          let value: DataKeyValueUpdate | null = null;
          if (!isNullOrUndefined(update.value)) {
            value = this.parseUpdateValue(update.value);
          }
          if (!isNullOrUndefined(id) && !isNullOrUndefined(type)) {
            result.push(new IdDataKeyUpdate(id, type, value));
          } else {
            console.log("UPDATE PARSE FAILED: ")
            console.log(v);
          }
        }
      }
    });

    return result;
  }
}

