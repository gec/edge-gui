/**
 * Copyright 2011-2018 Green Energy Corp.
 *
 * Licensed to Green Energy Corp (www.greenenergycorp.com) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. Green Energy
 * Corp licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

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
