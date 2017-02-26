import { expect, assert } from 'chai'
import ProfileSDKErrors from '../../src/profile/errors'

describe('ProfileSDK.Errors', () => {
  describe('.NotAuthedError', () => {
    it('should exist', () => {
      expect(ProfileSDKErrors.NotAuthedError).to.exist
    })
  })

  describe('.NotFoundError', () => {
    it('should exist', () => {
      expect(ProfileSDKErrors.NotFoundError).to.exist
    })
  })

  describe('.NotFoundYetError', () => {
    it('should exist', () => {
      expect(ProfileSDKErrors.NotFoundYetError).to.exist
    })
  })

  describe('.InitialRequestTimeoutError', () => {
    it('should exist', () => {
      expect(ProfileSDKErrors.InitialRequestTimeoutError).to.exist
    })
  })

  describe('.RateLimitHitError', () => {
    it('should exist', () => {
      expect(ProfileSDKErrors.RateLimitHitError).to.exist
    })
  })
})
