import { expect, assert } from 'chai'
import Errors from '../../src/errors'

describe('Errors', () => {
  describe('.NotAuthedError', () => {
    it('should exist', () => {
      expect(Errors.NotAuthedError).to.exist
    })
  })

  describe('.NotFoundError', () => {
    it('should exist', () => {
      expect(Errors.NotFoundError).to.exist
    })
  })

  describe('.NotFoundYetError', () => {
    it('should exist', () => {
      expect(Errors.NotFoundYetError).to.exist
    })
  })

  describe('.InitialRequestTimeoutError', () => {
    it('should exist', () => {
      expect(Errors.InitialRequestTimeoutError).to.exist
    })
  })

  describe('.RateLimitHitError', () => {
    it('should exist', () => {
      expect(Errors.RateLimitHitError).to.exist
    })
  })
})
