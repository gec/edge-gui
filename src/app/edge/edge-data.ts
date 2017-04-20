
import { isNullOrUndefined } from "util";
import { KeyedMap, KeyedMapImpl, KeyLike } from "./data-structure";


export interface NumericValue {
  readonly value: number
}


export class FloatValue implements NumericValue, KeyLike {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "FloatValue(" + this.value + ")" };
}
export class DoubleValue implements NumericValue {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "DoubleValue(" + this.value + ")" };
}
export class SInt32Value implements NumericValue {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "SInt32Value(" + this.value + ")" };
}
export class UInt32Value implements NumericValue {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "UInt32Value(" + this.value + ")" };
}
export class SInt64Value implements NumericValue {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "SInt64Value(" + this.value + ")" };
}
export class UInt64Value implements NumericValue {
  constructor(public readonly value: number) {}
  toStringKey(): String { return "UInt64Value(" + this.value + ")" };
}
export class BoolValue {
  constructor(public readonly value: boolean) {}
  toStringKey(): String { return "BoolValue(" + this.value + ")" };
}
export class StringValue {
  constructor(public readonly value: string) {}
  toStringKey(): String { return "StringValue(" + this.value + ")" };
}
export class BytesValue {
  constructor(public readonly value: string) {}
  toStringKey(): String { return "BytesValue(" + this.value + ")" };
}
/*export class MapValue {
  constructor(public readonly value: Map<EdgeValue, EdgeValue>) {}
}*/
export class MapValue {
  constructor(public readonly value: KeyedMap<EdgeValue, EdgeValue>) {}
  toStringKey(): String { return "MapValue(" + this.value.pairs().map(v => "(" + v[0] + "," + v[1] + ")").join(",") + ")" };
}
export class ListValue {
  constructor(public readonly value: Array<EdgeValue>) {}
  toStringKey(): String { return "ListValue(" + this.value.map(v => v.toStringKey()).join(",") + ")" };
}
export class TaggedValue {
  constructor(public readonly tag: string, public readonly value: EdgeValue) {}
  toStringKey(): String { return "TaggedValue(" + this.tag + "," + this.value.toStringKey() + ")" };
}

export type EdgeValue = FloatValue | DoubleValue | SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue | StringValue | BytesValue | MapValue | ListValue | TaggedValue
export type IndexableValue = SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue | StringValue | BytesValue
export type SampleValue = FloatValue | DoubleValue | SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue


export class EdgeDataParser {

  static parseNum<A>(v: any, f: (parsed: number) => A): A | null {
    // uint64 from proto is a string
    if (!isNullOrUndefined(v) /*&& typeof v === "number"*/) {
      return f(+v);
    } else {
      return null;
    }
  }
  static parseString<A>(v: any, f: (parsed: string) => A): A | null {
    if (!isNullOrUndefined(v) && typeof v === "string") {
      return f(v);
    } else {
      return null;
    }
  }
  static parseBool<A>(v: any, f: (parsed: boolean) => A): A | null {
    if (!isNullOrUndefined(v) && typeof v === "boolean") {
      return f(v);
    } else {
      return null;
    }
  }
  static parseList(v: any): ListValue | null {
    if (!isNullOrUndefined(v) && !isNullOrUndefined(v.element)) {
      let array: EdgeValue[] = v.element.map(elem => EdgeDataParser.parseValue(elem));
      if (array.every(v => !isNullOrUndefined(v))) {
        return new ListValue(array);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  static parseMap(v: any): MapValue | null {
    if (!isNullOrUndefined(v) && !isNullOrUndefined(v.fields)) {
      let pairs: [EdgeValue, EdgeValue][] = [];
      v.fields.forEach(p => {
        if (!isNullOrUndefined(p.key) && !isNullOrUndefined(p.value)) {
          let key = EdgeDataParser.parseValue(p.key);
          let resultV = EdgeDataParser.parseValue(p.value);
          if (!isNullOrUndefined(key) && !isNullOrUndefined(resultV)) {
            pairs.push([key, resultV]);
          } else {
            return null;
          }
        } else {
          return null;
        }
      });

      let map = new Map<String, [EdgeValue, EdgeValue]>();
      pairs.forEach(p => {
        if (!isNullOrUndefined(p)) {
          map.set(p[0].toStringKey(), p)
        }
      });
      return new MapValue(new KeyedMapImpl(map));

    } else {
      return null;
    }
  }
  static parseTaggedValue(v: any): TaggedValue | null {
    console.log("parseTaggedValue");
    console.log(v);
    if (!isNullOrUndefined(v) && !isNullOrUndefined(v.tag) && !isNullOrUndefined(v.value)) {
      let basicValue = this.parseValue(v.value);
      if (!isNullOrUndefined(basicValue) && typeof v.tag === 'string') {
        return new TaggedValue(v.tag, basicValue);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static parseValue(pjson: any): EdgeValue | null {
    if (!isNullOrUndefined(pjson)) {

      let me = EdgeDataParser;

      let result = me.parseString(pjson.stringValue, v => new StringValue(v)) ||
        me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
        me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
        me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
        me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
        me.parseBool(pjson.boolValue, v => new BoolValue(v)) ||
        me.parseNum(pjson.floatValue, v => new FloatValue(v)) ||
        me.parseNum(pjson.doubleValue, v => new DoubleValue(v)) ||
        me.parseString(pjson.bytesValue, v => new BytesValue(v)) ||
        me.parseList(pjson.listValue) ||
        me.parseMap(pjson.mapValue) ||
        me.parseTaggedValue(pjson.taggedValue);

      if (!result) {
        console.log("COULD NOT PARSE:");
        console.log(pjson);
      }

      return result;
    } else {
      return null;
    }
  }

  static parseIndexableValue(pjson: any): IndexableValue | null {

    let me = EdgeDataParser;

    let result = me.parseString(pjson.stringValue, v => new StringValue(v)) ||
      me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
      me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
      me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
      me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
      me.parseBool(pjson.boolValue, v => new BoolValue(v)) ||
      me.parseString(pjson.bytesValue, v => new BytesValue(v))

    return result;
  }

  static parseSampleValue(pjson: any): SampleValue | null {

    let me = EdgeDataParser;

    let result =
      me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
      me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
      me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
      me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
      me.parseNum(pjson.floatValue, v => new FloatValue(v)) ||
      me.parseNum(pjson.doubleValue, v => new DoubleValue(v)) ||
      me.parseBool(pjson.boolValue, v => new BoolValue(v));

    return result;
  }
}
