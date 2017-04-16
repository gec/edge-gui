
export interface NumericValue {
  readonly value: number
}



export class FloatValue implements NumericValue {
  constructor(public readonly value: number) {}
}
export class DoubleValue implements NumericValue {
  constructor(public readonly value: number) {}
}
export class SInt32Value implements NumericValue {
  constructor(public readonly value: number) {}
}
export class UInt32Value implements NumericValue {
  constructor(public readonly value: number) {}
}
export class SInt64Value implements NumericValue {
  constructor(public readonly value: number) {}
}
export class UInt64Value implements NumericValue {
  constructor(public readonly value: number) {}
}
export class BoolValue {
  constructor(public readonly value: boolean) {}
}
export class StringValue {
  constructor(public readonly value: string) {}
}
export class BytesValue {
  constructor(public readonly value: string) {}
}
export class MapValue {
  constructor(public readonly value: Map<EdgeValue, EdgeValue>) {}
}
export class ListValue {
  constructor(public readonly value: Array<EdgeValue>) {}
}
export class TaggedValue {
  constructor(public readonly tag: string, value: EdgeValue) {}
}

export type EdgeValue = FloatValue | DoubleValue | SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue | StringValue | BytesValue | MapValue | ListValue | TaggedValue
export type IndexableValue = SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue | StringValue | BytesValue
export type SampleValue = FloatValue | DoubleValue | SInt32Value | UInt32Value | SInt64Value | UInt64Value | BoolValue


export class EdgeValueProtoParser {

  static parseNum<A>(v: any, f: (parsed: number) => A): A | null {
    if (v && typeof v === "number") {
      return f(v);
    } else {
      return null;
    }
  }
  static parseString<A>(v: any, f: (parsed: string) => A): A | null {
    if (v && typeof v === "string") {
      return f(v);
    } else {
      return null;
    }
  }
  static parseBool<A>(v: any, f: (parsed: boolean) => A): A | null {
    if (v && typeof v === "boolean") {
      return f(v);
    } else {
      return null;
    }
  }
  static parseList(v: any): ListValue | null {
    if (v && v.element) {
      return null;
    } else {
      return null;
    }
  }

  static parseValue(pjson: any): EdgeValue | null {

    let me = EdgeValueProtoParser;

    let result = me.parseString(pjson.stringValue, v => new StringValue(v)) ||
      me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
      me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
      me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
      me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
      me.parseBool(pjson.boolValue, v => new BoolValue(v)) ||
      me.parseNum(pjson.floatValue, v => new FloatValue(v)) ||
      me.parseNum(pjson.doubleValue, v => new DoubleValue(v)) ||
      me.parseString(pjson.bytesValue, v => new BytesValue(v)) ||
      me.parseList(pjson.listValue);

    return result;
  }

  static parseIndexableValue(pjson: any): IndexableValue | null {

    let me = EdgeValueProtoParser;

    let result = me.parseString(pjson.stringValue, v => new StringValue(v)) ||
      me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
      me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
      me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
      me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
      me.parseBool(pjson.boolValue, v => new BoolValue(v)) ||
      me.parseString(pjson.bytesValue, v => new BytesValue(v))

    return result;
  }

  static parseSampleValue(pjson: any): IndexableValue | null {

    let me = EdgeValueProtoParser;

    let result = me.parseString(pjson.stringValue, v => new StringValue(v)) ||
      me.parseNum(pjson.sint32Value, v => new SInt32Value(v)) ||
      me.parseNum(pjson.uint32Value, v => new UInt32Value(v)) ||
      me.parseNum(pjson.sint64Value, v => new SInt64Value(v)) ||
      me.parseNum(pjson.uint64Value, v => new UInt64Value(v)) ||
      me.parseBool(pjson.boolValue, v => new BoolValue(v)) ||
      me.parseString(pjson.bytesValue, v => new BytesValue(v))

    return result;
  }
}
