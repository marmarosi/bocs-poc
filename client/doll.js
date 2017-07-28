import Dummy from './dummy';

export default class Doll extends Dummy {
  constructor( category ) {
    super( 'Doll' );
    this.category = category;
  }
};
