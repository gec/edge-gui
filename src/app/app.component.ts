import { Component, OnInit } from '@angular/core';
import { EdgeConsumerService } from "./edge-consumer.service";
import { EndpointId, Path } from "./edge/edge-model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  endpoints: EndpointId[] = [];

  constructor(private service: EdgeConsumerService) {}

  ngOnInit(): void {
    this.service.subscribePrefixes([new Path([])]).forEach(updates => {
      if (updates.length > 0) {
        let last = updates[updates.length - 1];
        this.endpoints = last.value.value;
      }
    })
  }

  toKeyString(path: Path): String {
    return Path.toStringKey(path);
  }
}
