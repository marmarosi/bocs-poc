"use strict";

import Animal from './module-1.mjs';

class Bear extends Animal {
  constructor( color ) {
    super( 'bear' );
    this.color = color;
  }
}

export default Bear;
