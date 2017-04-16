
import { EdgeValue, EdgeValueProtoParser, IndexableValue } from "./edge-data";


export class Path {
  constructor(public readonly part: string[]) {
  }

  toKeyString(): string {
    return Path.toKeyString(this);
  }

  static toKeyString(path: Path): string {
    let result = "";
    let first = true;
    path.part.forEach(p => {
      if (first) {
        result = p;
        first = false;
      } else {
        result = result + "/" + p
      }
    });
    return result;
  }

  static fromKeyString(s: string): Path {
    return new Path(s.split('/'))
  }

  static of(a: string[]): Path {
    return new Path(a);
  }
}
export class EndpointId {
  constructor(public readonly name: Path) {
  }
}
export class EndpointPath {
  endpointId: EndpointId;
  key: Path;
}

enum DataKeyTypes {
  LatestKeyValue,
  TimeSeriesValue,
  EventTopicValue,
  ActiveSetValue,
}

export class LatestKeyValueDescriptor {
  kind: DataKeyTypes.LatestKeyValue;
  constructor() {}
}
export class TimeSeriesValueDescriptor {
  kind: DataKeyTypes.TimeSeriesValue;
  constructor() {}
}
export class EventTopicValueDescriptor {
  kind: DataKeyTypes.EventTopicValue;
  constructor() {}
}
export class ActiveSetValueDescriptor {
  kind: DataKeyTypes.ActiveSetValue;
  constructor() {}
}

export type TypeDescriptor = LatestKeyValueDescriptor | TimeSeriesValueDescriptor | EventTopicValueDescriptor | ActiveSetValueDescriptor

export class DataKeyDescriptor {
  constructor(
    public readonly indexes: Map<Path, IndexableValue>,
    public readonly metadata: Map<Path, EdgeValue>,
    public readonly typeDescriptor?: TypeDescriptor,
  ) {}
}
export class OutputKeyDescriptor {
  constructor(
    public readonly indexes: Map<Path, IndexableValue>,
    public readonly metadata: Map<Path, EdgeValue>,
  ) {}
}

export type KeyDescriptor = DataKeyDescriptor | OutputKeyDescriptor

export class EndpointDescriptor {
  constructor(
    public readonly indexes: Map<Path, IndexableValue>,
    public readonly metadata: Map<Path, EdgeValue>,
    public readonly dataKeySet: Map<Path, DataKeyDescriptor>,
    public readonly outputKeySet: Map<Path, OutputKeyDescriptor>,
  ) {}
}

export class IndexSpecifier {
  constructor(
    public readonly key: Path,
    public readonly value?: IndexableValue,
  ) {}
}


export class ProtoJsonModelParser {

  static parsePath(pjson: any): Path | null {
    if (pjson.part && pjson.part instanceof Array) {
      let result: string[] | null = pjson.part.reduce((accum, v) => {
        if (typeof v === 'string') {
          accum.push(v);
          return accum;
        } else {
          return null;
        }
      }, []);

      if (result !== null) {
        return new Path(result);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static parsePathMap<A>(pjson: any, f: (value: any) => A | null): Map<Path, A> {
    let result = new Map<Path, A>();
    pjson.forEach(kvObj => {
      if (kvObj.key && kvObj.value) {
        let path = this.parsePath(kvObj.key);
        let value = f(kvObj.value);
        if (path !== null && value !== null) {
          result.set(path, value);
        }
      }
    });
    return result;
  }

  static parseDataKeyDescriptor(pjson: any): DataKeyDescriptor {

    let indexMap = new Map<Path, IndexableValue>();
    if (pjson.indexes) {
      indexMap = ProtoJsonModelParser.parsePathMap(pjson.indexes, EdgeValueProtoParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = ProtoJsonModelParser.parsePathMap(pjson.metadata, EdgeValueProtoParser.parseValue);
    }

    let desc: TypeDescriptor;
    if (pjson.latestKeyValue) {
      desc = new LatestKeyValueDescriptor();
    } else if (pjson.timeSeriesValue) {
      desc = new TimeSeriesValueDescriptor();
    } else if (pjson.eventTopicValue) {
      desc = new EventTopicValueDescriptor();
    } else if (pjson.activeSetValue) {
      desc = new ActiveSetValueDescriptor();
    }

    return new DataKeyDescriptor(indexMap, metadataMap, desc);
  }

  static parseOutputKeyDescriptor(pjson: any): OutputKeyDescriptor {

    let indexMap = new Map<Path, IndexableValue>();
    if (pjson.indexes) {
      indexMap = ProtoJsonModelParser.parsePathMap(pjson.indexes, EdgeValueProtoParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = ProtoJsonModelParser.parsePathMap(pjson.metadata, EdgeValueProtoParser.parseValue);
    }

    return new OutputKeyDescriptor(indexMap, metadataMap);
  }
  static parseEndpointDescriptor(pjson: any): EndpointDescriptor {

    let indexMap = new Map<Path, IndexableValue>();
    if (pjson.indexes) {
      indexMap = ProtoJsonModelParser.parsePathMap(pjson.indexes, EdgeValueProtoParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = ProtoJsonModelParser.parsePathMap(pjson.metadata, EdgeValueProtoParser.parseValue);
    }

    let dataKeySet = new Map<Path, DataKeyDescriptor>();
    if (pjson.dataKeySet) {
      dataKeySet = ProtoJsonModelParser.parsePathMap(pjson.dataKeySet, this.parseDataKeyDescriptor);
    }

    let outputKeySet = new Map<Path, OutputKeyDescriptor>();
    if (pjson.outputKeySet) {
      outputKeySet = ProtoJsonModelParser.parsePathMap(pjson.outputKeySet, this.parseOutputKeyDescriptor);
    }

    return new EndpointDescriptor(indexMap, metadataMap, dataKeySet, outputKeySet);
  }
}
