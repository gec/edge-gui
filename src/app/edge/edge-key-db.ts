

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

class EdgeModelReader {

  /*static seriesValueMapper(metadata: PathMap<EdgeValue>): SeriesValueMapper | null {
    return null;
  }*/
}

export interface SeriesValueMapper {
  transform(v: SampleValue): number | boolean | string | null
}

export class TimeSeriesValue {
  constructor(
    public readonly value: SampleValue,
    public readonly jsValue: boolean | number | string,
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

  private processMetadata(metadata: PathMap<EdgeValue>) {
    this.seriesType = EdmCore.readSeriesType(metadata);
    if (this.seriesType === "boolean_status") {
      this.mapper = EdmCore.booleanValueMapper(metadata)
    } else if (this.seriesType === "integer_enum") {
      this.mapper = EdmCore.integerValueMapper(metadata)
    }

    this.unit = EdmCore.readUnit(metadata);
  }

  handle(update: IdKeyUpdate): void {
    this.status = update.statusType;
    if (update.statusType === "RESOLVED_VALUE" && (update.constructor === IdDataKeyUpdate)) {
      let dataUpdate = update as IdDataKeyUpdate;
      if (!isNullOrUndefined(dataUpdate.value) && dataUpdate.value.constructor === SeriesUpdate) {
        let up: SeriesUpdate = dataUpdate.value as SeriesUpdate;
        if (!isNullOrUndefined(up.descriptorUpdate)) {
          this.processMetadata(up.descriptorUpdate.metadata);
        }

        let renderValue: boolean | number | string;
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
    if (update.statusType === "RESOLVED_VALUE" && (update.constructor === IdDataKeyUpdate)) {
      let dataUpdate = update as IdDataKeyUpdate;
      if (!isNullOrUndefined(dataUpdate.value) && dataUpdate.value.constructor === KeyValueUpdate) {
        let up: KeyValueUpdate = dataUpdate.value as KeyValueUpdate;
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
    if (update.statusType === "RESOLVED_VALUE" && (update.constructor === IdDataKeyUpdate)) {
      let dataUpdate = update as IdDataKeyUpdate;
      if (!isNullOrUndefined(dataUpdate.value) && dataUpdate.value.constructor === TopicEventUpdate) {
        let up: TopicEventUpdate = dataUpdate.value as TopicEventUpdate;

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
      let v = tup[1];
      if (v.constructor === DataKeyDescriptor) {
        let dataKeyDesc = v as DataKeyDescriptor;
        if (dataKeyDesc.typeDescriptor.constructor === TimeSeriesValueDescriptor) {
          let desc = dataKeyDesc.typeDescriptor as TimeSeriesValueDescriptor;
          let db = new TimeSeriesDb(id, dataKeyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        } else if (dataKeyDesc.typeDescriptor.constructor === LatestKeyValueDescriptor) {
          let desc = dataKeyDesc.typeDescriptor as LatestKeyValueDescriptor;
          let db = new KeyValueDb(id, dataKeyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        } else if (dataKeyDesc.typeDescriptor.constructor === EventTopicValueDescriptor) {
          let desc = dataKeyDesc.typeDescriptor as EventTopicValueDescriptor;
          let db = new EventDb(id, dataKeyDesc.metadata, desc);
          this.map.set(id.toStringKey(), db);
        }
      } else if (v.constructor === OutputKeyDescriptor) {
        let outputKeyDesc = v as OutputKeyDescriptor;
        let db = new OutputKeyDb(id, outputKeyDesc.metadata);
        this.map.set(id.toStringKey(), db)
      }
    })
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
      if (v.constructor === IdDataKeyUpdate) {
        let up = v as IdDataKeyUpdate;
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


/*
message KeyValueUpdate {
  edge.data.Value jsValue = 1;
}
message SeriesUpdate {
  edge.data.SampleValue jsValue = 1;
  uint64 time = 2;
}
message TopicEventUpdate {
  edge.Path topic = 1;
  edge.data.Value jsValue = 2;
  uint64 time = 3;
}


var tsDb = function(tsDesc, indexes, metadata) {

  // TODO: caching, rotating store, etc...
  var current = null;

  var integerMap = null;
  if (metadata != null && metadata.integerMapping != null) {
    console.log("integer mapping: ");
    console.log(metadata.integerMapping);
    integerMap = {};
    metadata.integerMapping.forEach(function(elem) {
      integerMap[elem.index] = elem.name;
    });
  }

  var boolMap = null;
  if (metadata != null && metadata.boolMapping != null) {
    console.log("bool mapping: ");
    console.log(metadata.boolMapping);
    boolMap = {};
    metadata.boolMapping.forEach(function(elem) {
      if (elem.jsValue != null) {
        boolMap[elem.jsValue] = elem.name;
      }
    });
  }


  var edgeSampleValueToJsSampleValue = function(v) {
    for (var k in v) {
      if (k === 'floatValue' || k === 'doubleValue') {
        return { decimal: v[k] }
      } else if (k === 'sint32Value' || k === 'uint32Value' || k === 'sint64Value' || k === 'uint64Value') {
        return { integer: v[k] }
      } else if (k === 'boolValue') {
        return { bool: v[k] }
      } else {
        console.log("Unrecognized sample jsValue type: ");
        console.log(v);
        return null;
      }
    }
  }

  var handleTsSeq = function(tss) {

    var v = sampleValueToSimpleValue(tss.jsValue);
    var t = tss.time;
    var date = new Date(parseInt(t));

    var typedValue = edgeSampleValueToJsSampleValue(tss.jsValue);
    if (typedValue != null && typedValue.integer != null && integerMap != null && integerMap[typedValue.integer] != null) {
      typedValue = { string: integerMap[typedValue.integer] };
    }
    if (typedValue != null && typedValue.bool != null && boolMap != null && boolMap[typedValue.bool] != null) {
      typedValue = { string: boolMap[typedValue.bool] };
    }

    current = { type: 'timeSeriesValue', jsValue: v, typedValue: typedValue, time: t, date: date };
  }

  return {
    currentValue: function() {
      return current;
    },
    observe: function(updateWrap) {
      if (updateWrap.seriesUpdate != null) {
        var update = updateWrap.seriesUpdate;
        handleTsSeq(update);
      }
    }
  }
};
var eventDb = function(desc, indexes, metadata) {

  var current = [];

  var handleEvents = function(arr) {
    arr.forEach(handleEvent);
  };

  var handleEvent = function(ev) {
    var date = new Date(parseInt(ev.time));
    current.push({
      topicParts: ev.topic.part,
      jsValue: valueToJsValue(ev.jsValue),
      time: ev.time,
      date: date
    });
    if (current.length > 100) {
      current.shift();
    }
  };

  return {
    currentValue: function() {
      return current;
    },
    observe: function(notification) {
      console.log("EVENT notification: ");
      console.log(notification);

      if (notification.topicEventUpdate != null) {
        handleEvent(notification.topicEventUpdate);
      }
    }
  }
};

var kvDb = function(kvDesc, indexes, metadata) {

  var current = null;

  var handleSeqValue = function(v) {
    console.log("handleValue: ");
    console.log(v);

    var jsValue = valueToJsValue(v);
    console.log("JSVALUE:");
    console.log(jsValue);

    current = {
      type: 'latestKeyValue',
      jsValue: v,
      jsValue: jsValue
    };
  };

  return {
    currentValue: function() {
      return current;
    },
    observe: function(notification) {
      console.log("KVDB notification: ");
      console.log(notification);

      if (notification.keyValueUpdate != null) {
        if (notification.keyValueUpdate.jsValue != null) {
          handleSeqValue(notification.keyValueUpdate.jsValue);
        }
      }
    }
  }
};


var dataObject = function(endpointId, key, desc, dbParam) {

  var name = pathToString(key);
  var indexes = null;
  var metadata = null;

  if (desc.indexes != null) {
    desc.indexes.forEach(function(kv) {
      if (indexes == null) { indexes = {}; }
      indexes[pathToString(kv.key)] = sampleValueToSimpleValue(kv.jsValue);
    });
  }
  if (desc.metadata != null) {
    desc.metadata.forEach(function(kv) {
      if (metadata == null) { metadata = {}; }
      metadata[pathToString(kv.key)] = valueToJsValue(kv.jsValue);
    });
  }

  var type = null;
  var db = nullDb();
  if (dbParam) {
    db = dbParam;
  } else {
    if (desc['timeSeriesValue'] != null) {
      db = tsDb(desc['timeSeriesValue'], indexes, metadata);
      type = 'timeSeriesValue';
    } else if (desc['latestKeyValue']) {
      db = kvDb(desc['latestKeyValue'], indexes, metadata);
      type = 'latestKeyValue';
    } else if (desc['eventTopicValue']) {
      db = eventDb(desc['eventTopicValue'], indexes, metadata);
      type = 'eventTopicValue';
    } else {
      console.log("unhandled desc:")
      console.log(desc);
    }
  }

  return {
    endpointId: endpointId,
    key: key,
    endPath: endpointPathFromIdAndKey(endpointId, key),
    name : name,
    type: type,
    indexes: indexes,
    metadata: metadata,
    db: db
  };
};

var outputObject = function(endpointId, key, desc) {

  var name = pathToString(key);
  var indexes = null;
  var metadata = null;

  console.log("OUTPUT DESC:");
  console.log(desc);

  if (desc.indexes != null) {
    desc.indexes.forEach(function(kv) {
      if (indexes == null) { indexes = {}; }
      indexes[pathToString(kv.key)] = sampleValueToSimpleValue(kv.jsValue);
    });
  }
  if (desc.metadata != null) {
    desc.metadata.forEach(function(kv) {
      if (metadata == null) { metadata = {}; }
      metadata[pathToString(kv.key)] = valueToJsValue(kv.jsValue);
    });
  }

  var inputDef = null;

  if (metadata != null) {
    var simpleInputType = metadata['simpleInputType'];
    if (simpleInputType != null) {
      if (simpleInputType === 'integer') {

        var mapping = metadata['integerMapping']
        if (mapping != null) {
          console.log("MAPPING: ");
          console.log(mapping);
          inputDef = { type: 'integer', mapping: mapping };
        } else {
          inputDef = { type: 'integer' };
        }

      } else if (simpleInputType === 'double') {
        inputDef = { type: 'double' };

      } else if (simpleInputType === 'indication') {
        inputDef = { type: 'indication' };
      }
    }
  }

  var endpointPath = endpointPathFromIdAndKey(endpointId, key);

  return {
    endpointId: endpointId,
    key: key,
    endPath: endpointPath,
    endpointPathString: endPathToObjKey(endpointPath),
    name: name,
    indexes: indexes,
    metadata: metadata,
    inputDef: inputDef
  };
};

*/
