

import { EdgeValue, IndexableValue, SampleValue } from "./edge-data";
import { DataKeyDescriptor, EndpointPath, OutputKeyDescriptor, Path } from "./edge-model";


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

class SeriesUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly value: SampleValue,
    public readonly time: number,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.Series;
  }
}
class KeyValueUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly value: EdgeValue,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.KeyValue;
  }
}
class TopicEventUpdate implements DataKeyValueUpdate {
  constructor(
    public readonly topic: Path,
    public readonly value: SampleValue,
    public readonly time: number,
    public readonly descriptorUpdate?: DataKeyDescriptor,
  ) {}

  updateType(): DataKeyUpdateType {
    return DataKeyUpdateType.TopicEvent;
  }
}
class ActiveSetUpdate implements DataKeyValueUpdate {
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

class IdDataKeyUpdate {
  constructor(
    public readonly id: EndpointPath,
    public readonly type: StatusType,
    public readonly value?: DataKeyValueUpdate,
  ) {}
}

class UUID {
  constructor(public readonly value: String) {}
}

class OutputKeyStatus {
  constructor(
    public readonly sequenceSession: UUID,
    public readonly sequence: number,
    public readonly value: EdgeValue,
  ) {}
}

class OutputKeyUpdate {
  constructor(
    public readonly status_update: OutputKeyStatus,
    public readonly descriptorUpdate?: OutputKeyDescriptor,
  ) {}
}


class IdOutputKeyUpdate {
  constructor(
    public readonly id: EndpointPath,
    public readonly type: StatusType,
    public readonly value?: OutputKeyUpdate,
  ) {}
}


/*
message OutputKeyStatus {
  UUID sequence_session = 1;
  uint64 sequence = 2;
  edge.data.Value value = 3;
}

message DataKeyValueUpdate {
  edge.DataKeyDescriptor descriptor_update = 1;
  oneof types {
    KeyValueUpdate key_value_update = 2;
    SeriesUpdate series_update = 3;
    TopicEventUpdate topic_event_update = 4;
    ActiveSetUpdate active_set_update = 5;
  }
}

message OutputKeyUpdate {
  edge.OutputKeyDescriptor descriptor_update = 1;
  edge.OutputKeyStatus status_update = 2;
}

message IdEndpointUpdate {
  edge.EndpointId id = 1;
  StatusType type = 2;
  edge.EndpointDescriptor value = 3;
}
message IdDataKeyUpdate {
  edge.EndpointPath id = 1;
  StatusType type = 2;
  DataKeyValueUpdate value = 3;
}
message IdOutputKeyUpdate {
  edge.EndpointPath id = 1;
  StatusType type = 2;
  OutputKeyUpdate value = 3;
}


message KeyValueUpdate {
  edge.data.Value value = 1;
}
message SeriesUpdate {
  edge.data.SampleValue value = 1;
  uint64 time = 2;
}
message TopicEventUpdate {
  edge.Path topic = 1;
  edge.data.Value value = 2;
  uint64 time = 3;
}

message MapKeyPair {
  edge.data.IndexableValue key = 1;
  edge.data.Value value = 2;
}

message ActiveSetUpdate {
  repeated MapKeyPair value = 1;
  repeated edge.data.IndexableValue removes = 2;
  repeated MapKeyPair adds = 3;
  repeated MapKeyPair modifies = 4;
}
*/
