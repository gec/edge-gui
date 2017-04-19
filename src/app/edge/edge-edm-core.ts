

import { Path, PathMap } from "./edge-model";
import { EdgeValue, MapValue, StringValue } from "./edge-data";
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

  static booleanValueMapper(metadata: PathMap<EdgeValue>): SeriesValueMapper | null {
    console.log("loading booleanValueMapper");
    console.log(metadata);
    let mapItem = metadata.get(EdmCore.booleanLabelKey);
    if (!isNullOrUndefined(mapItem)) {
      let boolMap = mapItem.item;
      if (boolMap instanceof MapValue) {

        console.log("BOOLMAP: ");
        console.log(boolMap);

        return null;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}


/*
object EdgeCoreModel {

  sealed abstract class SeriesType(val value: String)
case object AnalogStatus extends SeriesType("analog_status")
case object AnalogSample extends SeriesType("analog_sample")
case object CounterStatus extends SeriesType("counter_status")
case object CounterSample extends SeriesType("counter_sample")
case object BooleanStatus extends SeriesType("boolean_status")
case object IntegerEnum extends SeriesType("integer_enum")

  def seriesType(seriesType: SeriesType): (Path, Value) = {
  (Path(Seq("edm", "core", "series_type")), ValueString(seriesType.value))
}

  def unitMetadata(unit: String): (Path, Value) = {
  (Path(Seq("edm", "core", "unit")), ValueString(unit))
}

  def labeledBooleanMetadata(truthLabel: String, falseLabel: String): (Path, Value) = {
  (Path(Seq("edm", "core", "boolean_label")),
    ValueMap(Map(
      ValueBool(true) -> ValueString(truthLabel),
    ValueBool(false) -> ValueString(falseLabel))))
}

  def labeledIntegerMetadata(map: Map[Long, String]): (Path, Value) = {

    val vmap: Map[Value, Value] = map.map {
  case (k, v) => (ValueInt64(k), ValueString(v))
  }

  (Path(Seq("edm", "core", "integer_label")),
    ValueMap(vmap))
}
}*/
