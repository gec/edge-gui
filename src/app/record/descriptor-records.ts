
import { EdgeValue } from "../edge/edge-data";
import { Path } from "../edge/edge-model";

export class MetadataRecord {
  constructor(
    public readonly path: Path,
    public readonly value: EdgeValue,
  ) {}
}

export class DataKeyRecord {
  constructor(
    public readonly path: Path,
    public readonly metadata: MetadataRecord[],
    public readonly type: String,
  ) {}
}
export class OutputKeyRecord {
  constructor(
    public readonly path: Path,
    public readonly metadata: MetadataRecord[]
  ) {}
}
