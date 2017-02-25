import { expect, assert } from 'chai'
import SDK from '../src/sdk'

describe('SDK', () => {
  describe('.key', () => {
    let orig_key

    beforeEach(() => {
      orig_key = SDK.key
    })

    afterEach(() => {
      SDK.key = orig_key
    })

    it('should be settable', () => {
      SDK.key = 'SomeOtherKey'
      expect(SDK.key).to.eql('SomeOtherKey')
    })
  })

  describe('.Profile', () => {
    it('should exist', () => {
      expect(SDK.Profile).to.exist
    })
  })
})
