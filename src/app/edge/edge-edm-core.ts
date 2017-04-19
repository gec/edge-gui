

import { Path, PathMap } from "./edge-model";
import {
  BoolValue, EdgeValue, MapValue, SampleValue, SInt32Value, SInt64Value, StringValue,
  UInt32Value, UInt64Value
} from "./edge-data";
import { SeriesValueMapper } from "./edge-key-db";
import { isNullOrUndefined } from "util";


export type SeriesType = "analog_status" | "analog_sample" | "counter_status" | "counter_sample" | "boolean_status" | "integer_enum"

export class EdmCore {
  static seriesTypeKey: string[] = ["edm", "core", "series_type"];
  static unitKey: string[] = ["edm", "core", "unit"];
  static booleanLabelKey: string[] = ["edm", "core", "boolean_label"];
  static integerLabelKey: string[] = ["edm", "core", "integer_label"];

  //static allSeriesTypes = ["analog_status", "analog_sample", "counter_status", "counter_sample", "boolean_status", "integer_enum"];

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
      console.log(item);
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

