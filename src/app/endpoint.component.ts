
import { Component, OnInit } from "@angular/core";
import { EdgeConsumerService } from "./edge-consumer.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import {
  EndpointDescriptor,
  EndpointId,
  Path
} from "./edge/edge-model";
import { KeyState } from "./edge/edge-key-db";



@Component({
  selector: 'endpoint',
  templateUrl: './endpoint.component.html',
  //styleUrls: ['./endpoint.component.css']
})
export class EndpointComponent implements OnInit {
  id: EndpointId = null;
  series: KeyState[];

  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location,) {}

  ngOnInit(): void {

    let typed = this.route.params.map((params: Params) => {
      let id = params['id'];
      console.log(id);
      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      this.id = endId;
      return this.service.subscribeEndpointDescriptor(endId);
    }).switchMap((obj: EndpointDescriptor) => {
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
