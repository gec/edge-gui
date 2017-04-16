
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
      this.id = endId;
      return this.service.subscribeEndpointDescriptor(endId);
    }).switchMap((obj: EndpointDescriptor) => {
      console.log("GOT ENDPOINT OBJ:");
      console.log(obj);

      return this.service.subscribeEndpointKeys(this.id, obj)

    }).map(keys => {
      console.log("COMPONENT GOT KEYS: ");
      console.log(keys);
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


*/
