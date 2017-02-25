import { expect, assert } from 'chai'
import * as APIConstants from '../../src/constants/api'
import { version as PKG_VERSION } from '../../package.json'

describe('APIConstants', () => {
  describe('.SDK_VERSION', () => {
    it('should equal version in package.json', () => {
      expect(APIConstants.SDK_VERSION).to.eql(PKG_VERSION)
    })
  })

  describe('.API_BASE_URL', () => {
    it('should include .crystalknows.com', () => {
      expect(APIConstants.API_BASE_URL).to.include('.crystalknows.com')
    })

    it('should use HTTPS', () => {
      expect(APIConstants.API_BASE_URL).to.include('https://')
    })
  })
})
