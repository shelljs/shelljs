import sinon from 'sinon';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';

//
// Sinon
//
global.sandbox = sinon.sandbox.create();

afterEach(() => {
  global.sandbox.restore();
});

//
// Chai
//
global.expect = chai.expect;
chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
