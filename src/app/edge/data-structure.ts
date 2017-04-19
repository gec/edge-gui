
import { isNullOrUndefined } from "util";


export interface KeyLike {
  toStringKey(): String
}

export interface KeyedMap<A extends KeyLike, B> {
  get(key: A): B | null
  pairs(): [A, B][];
}

export class KeyedMapImpl<A extends KeyLike, B> implements KeyedMap<A, B> {
  constructor(
    private readonly itemsMap: Map<String, [A, B]>
  ) {
    itemsMap.forEach((v, k) => this.objArray.push(v))
  }
  private readonly objArray: [A, B][] = [];

  get(key: A): null | B {
    let keyStr = key.toStringKey();
    let result = this.itemsMap.get(keyStr);
    if (!isNullOrUndefined(result)) {
      return result[1];
    } else {
      return null;
    }
  }

  pairs(): [A, B][] {
    return this.objArray;
  }

  static empty<A extends KeyLike, B>(): KeyedMap<A, B> {
    return new KeyedMapImpl(new Map<String, [A, B]>());
  }
}
