
import { Component, OnInit } from "@angular/core";
import {EdgeConsumerService, TypedStates} from "./edge-consumer.service";
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
  pageState: string = "uninit";
  id: EndpointId = null;
  series: KeyState[];
  keyValues: KeyState[];
  events: KeyState[];
  activeSets: KeyState[];
  outputs: KeyState[];

  seq: number = 0;

  constructor(private service: EdgeConsumerService,
              private route: ActivatedRoute,
              private location: Location,) {}

  ngOnInit(): void {
    let typed = this.route.params.map((params: Params) => {
      let id = params['id'];
      console.log(id);
      console.log("seq: " + this.seq);
      this.seq += 1;
      this.pageState = "uninit";

      return new EndpointId(Path.fromKeyString(id))
    }).switchMap((endId: EndpointId) => {
      this.id = endId;
      this.pageState = "pending";
      return this.service.subscribeEndpointDescriptor(endId);
    }).switchMap((obj: EndpointDescriptor) => {
      this.pageState = "described";

      let [initial, dataUpdates] = this.service.typedTabular(this.id, obj);
      this.handleUpdates(initial);

      return dataUpdates;

      //return this.service.typedTabular(this.id, obj).delay(2000)
    });

    typed.forEach(v => {
      if (this.pageState === "described") {
        this.pageState = "subscribed";
      }

      this.handleUpdates(v);
    });
  }

  private handleUpdates(v: TypedStates) {

    let sortStates = (l: KeyState, r: KeyState) => {
      return l.key.toStringKey().localeCompare(r.key.toStringKey())
    };

    this.keyValues = v.keyValues.sort(sortStates);
    this.series = v.series.sort(sortStates);
    this.events = v.topicEvents.sort(sortStates);
    this.activeSets = v.activeSets.sort(sortStates);
    this.outputs = v.outputs.sort(sortStates);
  }
}

