import { expect, assert } from 'chai'
import ApiSDK from '../src/api'
import CrystalSDK from '../src/sdk'
import * as APIConstants from '../src/constants/api'
import sinon from 'sinon'
import nock from 'nock'

nock.disableNetConnect()

describe('ApiSDK', () => {
  describe('.fetchOrgToken', () => {
    let origKey
    beforeEach(() => {
      origKey = CrystalSDK.key
    })

    afterEach(() => {
      CrystalSDK.key = origKey
    })

    context('CrystalSDK.key not set', () => {

      it('should throw ApiKeyNotSet', () => {
        CrystalSDK.key = null
        expect(() => ApiSDK.fetchOrgToken()).to.throw(ApiSDK.ApiKeyNotSet)
      })

    })

    context('CrystalSDK.key is set', () => {

      it('should return CrystalSDK.key', () => {
        CrystalSDK.key = 'SomeKey'
        expect(ApiSDK.fetchOrgToken()).to.eql('SomeKey')
      })

    })
  })

  describe('.makeRequest', () => {
    context('CrystalSDK.key not set', () => {

      it('should throw ApiKeyNotSet', () => {
        CrystalSDK.key = null
        expect(() => ApiSDK.makeRequest()).to.throw(ApiSDK.ApiKeyNotSet)
      })
    })

    context('CrystalSDK.key is set', () => {
      const orgToken = 'SomeKey'
      let oldToken
      beforeEach(() => {
        oldToken = CrystalSDK.key
        CrystalSDK.key = orgToken
      })

      afterEach(() => {
        CrystalSDK.key = oldToken
      })

      it('should be capable of a get request', (done) => {
        nock(APIConstants.API_BASE_URL)
          .get('/something')
          .reply(202, {testing_resp: 'true'})

        ApiSDK.makeRequest('get', 'something').then((resp) => {
          expect(resp.body).to.eql({testing_resp: 'true'})
          expect(resp.statusCode).to.eql(202)
          done()
        })
      })

      it('should be capable of a put request', (done) => {
        nock(APIConstants.API_BASE_URL)
          .put('/something')
          .reply(202, {testing_resp: 'true'})

        ApiSDK.makeRequest('put', 'something').then((resp) => {
          expect(resp.body).to.eql({testing_resp: 'true'})
          expect(resp.statusCode).to.eql(202)
          done()
        })
      })

      it('should be capable of a post request', (done) => {
        nock(APIConstants.API_BASE_URL)
          .post('/something')
          .reply(202, {testing_resp: 'true'})

        ApiSDK.makeRequest('post', 'something').then((resp) => {
          expect(resp.body).to.eql({testing_resp: 'true'})
          expect(resp.statusCode).to.eql(202)
          done()
        })
      })

      it('should be capable of a delete request', (done) => {
        nock(APIConstants.API_BASE_URL)
          .delete('/something')
          .reply(202, {testing_resp: 'true'})

        ApiSDK.makeRequest('delete', 'something').then((resp) => {
          expect(resp.body).to.eql({testing_resp: 'true'})
          expect(resp.statusCode).to.eql(202)
          done()
        })
      })

      context('resolves to a response', () => {
        beforeEach(() => {
          nock(APIConstants.API_BASE_URL)
            .post('/something')
            .reply(202, {testing_resp: 'true'})
        })

        it('should resolve with a body property', (done) => {
          ApiSDK.makeRequest('post', 'something').then((resp) => {
            expect(resp.body).to.eql({testing_resp: 'true'})
            done()
          })
        })

        it('should resolve with a statusCode property', (done) => {
          ApiSDK.makeRequest('post', 'something').then((resp) => {
            expect(resp.statusCode).to.eql(202)
            done()
          })
        })
      })

      context('gets a 4xx response', () => {
        beforeEach(() => {
          nock(APIConstants.API_BASE_URL)
            .post('/something')
            .reply(404, {testing_reject: 'true'})
        })

        it('should reject with a statusCode property', (done) => {
          ApiSDK.makeRequest('post', 'something').catch((err) => {
            expect(err.statusCode).to.eql(404)
            done()
          })
        })
      })

      context('gets a 5xx response', () => {
        beforeEach(() => {
          nock(APIConstants.API_BASE_URL)
            .post('/something')
            .reply(500, {testing_reject: 'true'})
        })

        it('should reject with a statusCode property', (done) => {
          ApiSDK.makeRequest('post', 'something').catch((err) => {
            expect(err.statusCode).to.eql(500)
            done()
          })
        })
      })

      it('should return the response of the correctly configured request', (done) => {
        const expectedHeaders = {
          'X-Sdk-Version': APIConstants.SDK_VERSION,
          'X-Org-Token': orgToken,
          'some': 'headers'
        }

        nock(APIConstants.API_BASE_URL, {reqheaders: expectedHeaders})
          .post('/endpoint', {some: 'params'})
          .reply(200, {testing_resp: 'true'})

        ApiSDK.makeRequest('post', 'endpoint', {some: 'params'}, {some: 'headers'})
          .then((resp) => {
            expect(resp.body).to.eql({testing_resp: 'true'})
            expect(resp.statusCode).to.eql(200)
            done()
          })
      })

      context('4xx error', () => {
        beforeEach(() => {
          nock(APIConstants.API_BASE_URL)
            .post('/endpoint')
            .reply(404)
        })

        it('should raise an error', (done) => {
          ApiSDK.makeRequest('post', 'endpoint')
            .catch((resp) => {
              expect(resp.statusCode).to.eql(404)
              done()
            })
        })
      })

      context('5xx error', () => {
        beforeEach(() => {
          nock(APIConstants.API_BASE_URL)
            .post('/endpoint')
            .reply(500)
        })

        it('should raise an error', (done) => {
          ApiSDK.makeRequest('post', 'endpoint')
            .catch((resp) => {
              expect(resp.statusCode).to.eql(500)
              done()
            })
        })
      })
    })
  })
})
