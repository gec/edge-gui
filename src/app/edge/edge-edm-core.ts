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


import { Path, PathMap } from "./edge-model";
import {
  BoolValue, EdgeValue, MapValue, NumericValue, SampleValue, SInt32Value, SInt64Value, StringValue,
  UInt32Value, UInt64Value
} from "./edge-data";
import { SeriesValueMapper } from "./edge-key-db";
import {isNullOrUndefined, isNumber} from "util";

/*
object OutputType {
case object SimpleIndication extends OutputType("simple_indication")
case object ParameterizedIndication extends OutputType("parameterized_indication")
case object AnalogSetpoint extends OutputType("analog_setpoint")
case object BooleanSetpoint extends OutputType("boolean_setpoint")
case object EnumerationSetpoint extends OutputType("enumeration_setpoint")
}*/

export type SeriesType = "analog_status" | "analog_sample" | "counter_status" | "counter_sample" | "boolean_status" | "integer_enum"
export type OutputType = "simple_indication" | "analog_setpoint" | "boolean_setpoint" | "enumeration_setpoint"

export class EdmCore {
  static seriesTypeKey: string[] = ["edm", "core", "series_type"];
  static unitKey: string[] = ["edm", "core", "unit"];
  static decimalPointsKey: string[] = ["edm", "core", "decimal_points"];
  static booleanLabelKey: string[] = ["edm", "core", "boolean_label"];
  static integerLabelKey: string[] = ["edm", "core", "integer_label"];

  static outputTypeKey: string[] = ["edm", "core", "output_type"];
  static outputRequestBooleanLabels: string[] = ["edm", "core", "request_boolean_labels"];
  static outputRequestIntegerLabels: string[] = ["edm", "core", "request_integer_labels"];
  static outputRequestScale: string[] = ["edm", "core", "request_scale"];
  static outputRequestOffset: string[] = ["edm", "core", "request_offset"];

  //static allSeriesTypes = ["analog_status", "analog_sample", "counter_status", "counter_sample", "boolean_status", "integer_enum"];


  private static readNumeric(key: string[], metadata: PathMap<EdgeValue>): number | null {
    let item = metadata.get(key);
    if (!isNullOrUndefined(item)) {
      let number = this.valueAsNumeric(item.item);
      if (!isNullOrUndefined(number)) {
        return number;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static readRequestScale(metadata: PathMap<EdgeValue>): number | null {
    return this.readNumeric(EdmCore.outputRequestScale, metadata);
  }

  static readRequestOffset(metadata: PathMap<EdgeValue>): number | null {
    return this.readNumeric(EdmCore.outputRequestOffset, metadata);
  }

  static readRequestIntegerLabels(metadata: PathMap<EdgeValue>): [string, number][] | null {
    let mapItem = metadata.get(EdmCore.outputRequestIntegerLabels);
    if (!isNullOrUndefined(mapItem)) {
      let map = mapItem.item;
      if (map instanceof MapValue) {
        let results: [string, number][] = [];
        map.value.pairs().forEach(pair => {
          let key = pair[0];
          let v = pair[1];
          if ((key instanceof SInt32Value || key instanceof UInt32Value || key instanceof SInt64Value || key instanceof UInt64Value) &&
            v instanceof StringValue) {
            results.push([v.value, key.value]);
          }
        });
        return results.sort((l, r) => l[0].localeCompare(r[0]));
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  static readOutputType(metadata: PathMap<EdgeValue>): OutputType {
    let result = metadata.get(EdmCore.outputTypeKey);
    if (result !== null && typeof result !== 'undefined') {
      let stringValue = result.item;
      if (stringValue instanceof StringValue) {
        let value = stringValue.value;
        switch (value) {
          case "simple_indication": return "simple_indication";
          //case "parameterized_indication": return "parameterized_indication";
          case "analog_setpoint": return "analog_setpoint";
          case "boolean_setpoint": return "boolean_setpoint";
          case "enumeration_setpoint": return "enumeration_setpoint";
        }
        return "simple_indication";
      } else {
        return "simple_indication";
      }
    } else {
      return "simple_indication";
    }
  }

  static readSeriesType(metadata: PathMap<EdgeValue>): SeriesType {
    let result = metadata.get(EdmCore.seriesTypeKey);
    if (result !== null && typeof result !== 'undefined') {
      let stringValue = result.item;
      if (stringValue instanceof StringValue) {
        let value = stringValue.value;
        switch (value) {
          case "analog_status": return "analog_status";
          case "analog_sample": return "analog_sample";
          case "counter_status": return "counter_status";
          case "counter_sample": return "counter_sample";
          case "boolean_status": return "boolean_status";
          case "integer_enum": return "integer_enum";
        }
        return "analog_status";

      } else {
        return "analog_status";
      }
    } else {
      return "analog_status";
    }
  }

  static readUnit(metadata: PathMap<EdgeValue>): string | null {
    let item = metadata.get(EdmCore.unitKey);
    if (!isNullOrUndefined(item)) {
      let value = item.item;
      if (value instanceof StringValue) {
        return value.value;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private static valueAsNumeric(value: EdgeValue): number | null {
    let v = value.value;
    if (typeof v === "number") {
      return v;
    } else if (typeof v === "string") {
      let num = Number.parseInt(v);
      if (Number.isFinite(num)) {
        return num;
      } else {
        return null;
      }
    }
  }

  static readDecimalPoints(metadata: PathMap<EdgeValue>): number | null {
    return this.readNumeric(EdmCore.decimalPointsKey, metadata);
  }

  static booleanValueMapper(metadata: PathMap<EdgeValue>): SeriesValueMapper | null {
    let mapItem = metadata.get(EdmCore.booleanLabelKey);
    if (!isNullOrUndefined(mapItem)) {
      let boolMap = mapItem.item;
      if (boolMap instanceof MapValue) {
        return LabelBoolMapper.load(boolMap);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  static integerValueMapper(metadata: PathMap<EdgeValue>): SeriesValueMapper | null {
    let mapItem = metadata.get(EdmCore.integerLabelKey);
    if (!isNullOrUndefined(mapItem)) {
      let map = mapItem.item;
      if (map instanceof MapValue) {
        return LabelIntMapper.load(map);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

// TODO: these could be one flexible thing, as long as we can be sure more specific logic won't be inserted in the future
class LabelBoolMapper implements SeriesValueMapper {

  constructor(private vmap: Map<boolean, string>) {}

  transform(v: SampleValue): number | boolean | string | null {
    if (v instanceof BoolValue) {
      return this.vmap.get(v.value) || null;
    } else {
      return null;
    }
  }

  static load(map: MapValue): LabelBoolMapper {
    let resultMap = new Map<boolean, string>();
    map.value.pairs().forEach(pair => {
      let key = pair[0];
      let v = pair[1];
      if (key instanceof BoolValue && v instanceof StringValue) {
        resultMap.set(key.value, v.value);
      }
    });
    return new LabelBoolMapper(resultMap);
  }
}


class LabelIntMapper implements SeriesValueMapper {

  constructor(private vmap: Map<number, string>) {}

  transform(v: SampleValue): number | boolean | string | null {
    if (typeof v.value === 'number') {
      return this.vmap.get(v.value) || null;
    } else {
      return null;
    }
  }

  static load(map: MapValue): LabelIntMapper {
    let resultMap = new Map<number, string>();
    map.value.pairs().forEach(pair => {
      let key = pair[0];
      let v = pair[1];
      if ((key instanceof SInt32Value || key instanceof UInt32Value || key instanceof SInt64Value || key instanceof UInt64Value) &&
        v instanceof StringValue) {
        resultMap.set(key.value, v.value);
      }
    });
    return new LabelIntMapper(resultMap);
  }
}

