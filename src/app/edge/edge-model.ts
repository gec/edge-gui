
import { EdgeValue, EdgeDataParser, IndexableValue } from "./edge-data";


export class Path {
  constructor(public readonly part: string[]) {
  }

  toStringKey(): string {
    return Path.toStringKey(this);
  }

  static toStringKey(path: Path): string {
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
  toStringKey(): string {
    return this.name.toStringKey();
  }
}
export class EndpointPath {
  constructor(
    public readonly endpointId: EndpointId,
    public readonly key: Path,
  ) {}
  toStringKey(): string {
    return this.endpointId.toStringKey() + "//" + this.key.toStringKey();
  }
}

export enum DataKeyTypes {
  LatestKeyValue,
  TimeSeriesValue,
  EventTopicValue,
  ActiveSetValue,
}

/*export interface TypeDescriptor {
  getKind(): DataKeyTypes;
}

export class LatestKeyValueDescriptor implements TypeDescriptor {
  kind: "LatestKeyValue";
  getKind() { return DataKeyTypes.LatestKeyValue; }
  constructor() {}
}
export class TimeSeriesValueDescriptor implements TypeDescriptor {
  kind: "TimeSeriesValue";
  getKind() { return DataKeyTypes.TimeSeriesValue; }
  //kind: DataKeyTypes.TimeSeriesValue;
  constructor() {}
}
export class EventTopicValueDescriptor implements TypeDescriptor {
  kind: "EventTopicValue";
  getKind() { return DataKeyTypes.EventTopicValue; }
  //kind: DataKeyTypes.EventTopicValue;
  constructor() {}
}
export class ActiveSetValueDescriptor implements TypeDescriptor {
  kind: "ActiveSetValue";
  getKind() { return DataKeyTypes.ActiveSetValue; }
  //kind: DataKeyTypes.ActiveSetValue;
  constructor() {}
}*/


export class LatestKeyValueDescriptor {
  //kind: "LatestKeyValue";
  constructor() {}
}
export class TimeSeriesValueDescriptor {
  //kind: "TimeSeriesValue";
  constructor() {}
}
export class EventTopicValueDescriptor {
  //kind: "EventTopicValue";
  constructor() {}
}
export class ActiveSetValueDescriptor {
  //kind: "ActiveSetValue";
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


export class EdgeModelParser {

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

  static parseEndpointId(pjson: any): EndpointId {
    if (pjson.name) {
      let path = this.parsePath(pjson.name);
      if (path) {
        return new EndpointId(path);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static parseEndpointPath(pjson: any): EndpointPath {
    if (pjson.endpointId && pjson.key) {
      let id = this.parseEndpointId(pjson.endpointId);
      let key = this.parsePath(pjson.key);
      if (id && key) {
        return new EndpointPath(id, key);
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
      indexMap = EdgeModelParser.parsePathMap(pjson.indexes, EdgeDataParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = EdgeModelParser.parsePathMap(pjson.metadata, EdgeDataParser.parseValue);
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
      indexMap = EdgeModelParser.parsePathMap(pjson.indexes, EdgeDataParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = EdgeModelParser.parsePathMap(pjson.metadata, EdgeDataParser.parseValue);
    }

    return new OutputKeyDescriptor(indexMap, metadataMap);
  }
  static parseEndpointDescriptor(pjson: any): EndpointDescriptor {

    let indexMap = new Map<Path, IndexableValue>();
    if (pjson.indexes) {
      indexMap = EdgeModelParser.parsePathMap(pjson.indexes, EdgeDataParser.parseIndexableValue);
    }

    let metadataMap = new Map<Path, EdgeValue>();
    if (pjson.metadata) {
      metadataMap = EdgeModelParser.parsePathMap(pjson.metadata, EdgeDataParser.parseValue);
    }

    let dataKeySet = new Map<Path, DataKeyDescriptor>();
    if (pjson.dataKeySet) {
      dataKeySet = EdgeModelParser.parsePathMap(pjson.dataKeySet, this.parseDataKeyDescriptor);
    }

    let outputKeySet = new Map<Path, OutputKeyDescriptor>();
    if (pjson.outputKeySet) {
      outputKeySet = EdgeModelParser.parsePathMap(pjson.outputKeySet, this.parseOutputKeyDescriptor);
    }

    return new EndpointDescriptor(indexMap, metadataMap, dataKeySet, outputKeySet);
  }
}
