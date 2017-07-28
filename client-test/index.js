import Doll from './doll';

global.bo = {
  getDoll() {
    return new Doll( 'Shanghai' );
  }
};
