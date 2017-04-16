
import { Component, OnInit } from "@angular/core";
import { EdgeConsumerService, TypedStates } from "./edge-consumer.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import {
  DataKeyDescriptor, EndpointDescriptor, EndpointId, EndpointPath, KeyDescriptor,
  Path
} from "./edge/edge-model";
import { SampleValue } from "./edge/edge-data";
import { EdgeKeyTable, KeyState } from "./edge/edge-key-db";
import { Observable } from "rxjs/Observable";



@Component({
  selector: 'endpoint',
  templateUrl: './endpoint.component.html',
  //styleUrls: ['./app.component.css']
})
export class EndpointComponent implements OnInit {
  id: EndpointId = null;
  series: KeyState[];

  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location,) {}

  ngOnInit(): void {

    let typed = this.route.params.map((params: Params) => {
      console.log("someone subscribed");
      let id = params['id'];
      console.log(id);
      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      this.id = endId;
      return this.service.subscribeEndpointDescriptor(endId);
    }).switchMap((obj: EndpointDescriptor) => {
      console.log("GOT ENDPOINT OBJ:");
      console.log(obj);

      return this.service.typedTabular(this.id, obj)
    });

    typed.forEach(v => {
      console.log("GOT SERIES UPDATE:");
      console.log(v);
      this.series = v.series;
    });
  }
}


/*


*/
