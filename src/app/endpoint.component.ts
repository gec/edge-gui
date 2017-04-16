
import { Component, OnInit } from "@angular/core";
import { EdgeConsumerService } from "./edge-consumer.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { DataKeyDescriptor, EndpointDescriptor, EndpointId, KeyDescriptor, Path } from "./edge/edge-model";
import { SampleValue } from "./edge/edge-data";

@Component({
  selector: 'endpoint',
  templateUrl: './endpoint.component.html',
  //styleUrls: ['./app.component.css']
})
export class EndpointComponent implements OnInit {
  id: EndpointId = null;

  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location,) {}

  ngOnInit(): void {
    this.route.params.map((params: Params) => {
      let id = params['id'];
      console.log(id);
      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      return this.service.subscribeEndpointDescriptor(endId);
    }).map((obj: EndpointDescriptor) => {
      console.log("GOT ENDPOINT OBJ:");
      console.log(obj);

    }).subscribe()

  }
}


class TimeSeriesDb {
  constructor(private desc: DataKeyDescriptor) {}


}

class EdgeKeyTable {
  constructor(private keys: KeyDescriptor[]) {
  }

  isActive(): boolean {
    return this.keys.length > 0;
  }
}

/*
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
      if (elem.value != null) {
        boolMap[elem.value] = elem.name;
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
        console.log("Unrecognized sample value type: ");
        console.log(v);
        return null;
      }
    }
  }

  var handleTsSeq = function(tss) {

    var v = sampleValueToSimpleValue(tss.value);
    var t = tss.time;
    var date = new Date(parseInt(t));

    var typedValue = edgeSampleValueToJsSampleValue(tss.value);
    if (typedValue != null && typedValue.integer != null && integerMap != null && integerMap[typedValue.integer] != null) {
      typedValue = { string: integerMap[typedValue.integer] };
    }
    if (typedValue != null && typedValue.bool != null && boolMap != null && boolMap[typedValue.bool] != null) {
      typedValue = { string: boolMap[typedValue.bool] };
    }

    current = { type: 'timeSeriesValue', value: v, typedValue: typedValue, time: t, date: date };
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
      value: valueToJsValue(ev.value),
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
      value: v,
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
        if (notification.keyValueUpdate.value != null) {
          handleSeqValue(notification.keyValueUpdate.value);
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
      indexes[pathToString(kv.key)] = sampleValueToSimpleValue(kv.value);
    });
  }
  if (desc.metadata != null) {
    desc.metadata.forEach(function(kv) {
      if (metadata == null) { metadata = {}; }
      metadata[pathToString(kv.key)] = valueToJsValue(kv.value);
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
      indexes[pathToString(kv.key)] = sampleValueToSimpleValue(kv.value);
    });
  }
  if (desc.metadata != null) {
    desc.metadata.forEach(function(kv) {
      if (metadata == null) { metadata = {}; }
      metadata[pathToString(kv.key)] = valueToJsValue(kv.value);
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
