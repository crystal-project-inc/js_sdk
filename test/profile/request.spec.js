import { expect, assert } from 'chai'
import ProfileSDK from '../../src/profile'
import ApiSDK from '../../src/api'
import sinon from 'sinon'
import nock from 'nock'

nock.disableNetConnect()

describe('ProfileSDK.RequestSDK', () => {
  let sandbox
  let req

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    req = new ProfileSDK.Request('some_id')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      let initialized = new ProfileSDK.Request('some_id')
      expect(initialized.id).to.eql('some_id')
    })
  })

  describe('.fromSearch', () => {
    let query = {is_some: 'query'}
    let endpoint = 'profile_search/async'
    let request_type = 'post'

    context('ApiSDK.makeRequest threw an error', () => {
      beforeEach(() => {
        let mock = sandbox.mock(ApiSDK)

        mock.expects('makeRequest').once()
          .withArgs(request_type, endpoint, query)
          .returns(Promise.reject('SomeError'))
      })

      it('should not suppress error', (done) => {
        ProfileSDK.Request.fromSearch(query).catch((err) => {
          expect(err).to.eql('SomeError')
          done()
        })
      })
    })

    context('ApiSDK.makeRequest resolves with a body.request_id', () => {
      beforeEach(() => {
        let mock = sandbox.mock(ApiSDK)
        let resp = {body: {request_id: 'some_request_id'}}

        mock.expects('makeRequest').once()
          .withArgs(request_type, endpoint, query)
          .returns(Promise.resolve(resp))
      })

      it('should return request with that id', (done) => {
        ProfileSDK.Request.fromSearch(query).then((new_req) => {
          expect(new_req).to.be.an.instanceOf(ProfileSDK.Request)
          expect(new_req.id).to.eql('some_request_id')
          done()
        })
      })
    })
  })

  describe('#fetchRequestInfo', () => {
    let endpoint = 'results/some_id'
    let request_type = 'get'

    context('cached_req_info exists', () => {
      beforeEach(() => {
        req.cached_req_info = 'some_cached_info'
      })

      it('should return cached_req_info', (done) => {
        req.fetchRequestInfo().then((info) => {
          expect(info).to.eql('some_cached_info')
          done()
        })
      })
    })

    context('cached_req_info is not defined', () => {

      it('should not cache results', (done) => {
        sandbox.stub(ApiSDK, 'makeRequest')
          .returns(Promise.resolve({body: 'some_body1'}))

        req.fetchRequestInfo().then((info) => {
          expect(info).to.eql('some_body1')

          ApiSDK.makeRequest.restore()
          sandbox.stub(ApiSDK, 'makeRequest')
            .returns(Promise.resolve({body: 'some_body2'}))

          req.fetchRequestInfo().then((info2) => {
            expect(info2).to.eql('some_body2')
            done()
          })
        })
      })

      context('ApiSDK.makeRequest threw an error', () => {
        beforeEach(() => {
          let mock = sandbox.mock(ApiSDK)

          mock.expects('makeRequest').once()
            .withArgs(request_type, endpoint)
            .returns(Promise.reject('SomeError'))
        })

        it('should not suppress the error', (done) => {
          req.fetchRequestInfo().catch((err) => {
            expect(err).to.eql('SomeError')
            done()
          })
        })
      })

      context('ApiSDK.makeRequest resolved a response', () => {
        context('response status is "complete"', () => {
          let resp = {body: {status: 'complete'}}

          beforeEach(() => {
            let mock = sandbox.mock(ApiSDK)

            mock.expects('makeRequest').once()
              .withArgs(request_type, endpoint)
              .returns(Promise.resolve(resp))
          })

          it('should set cached_req_info to resp', (done) => {
            req.fetchRequestInfo().then((api_resp) => {
              expect(api_resp).to.eql(resp.body)
              expect(req.cached_req_info).to.eql(resp.body)
              done()
            })
          })
        })

        context('response status is "error"', () => {
          let resp = {body: {status: 'error'}}

          beforeEach(() => {
            let mock = sandbox.mock(ApiSDK)

            mock.expects('makeRequest').once()
              .withArgs(request_type, endpoint)
              .returns(Promise.resolve(resp))
          })

          it('should set cached_req_info to resp', (done) => {
            req.fetchRequestInfo().then((api_resp) => {
              expect(api_resp).to.eql(resp.body)
              expect(req.cached_req_info).to.eql(resp.body)
              done()
            })
          })
        })

        context('response status is neither "complete" nor "error"', () => {
          let resp = {body: {status: 'processing'}}

          beforeEach(() => {
            let mock = sandbox.mock(ApiSDK)

            mock.expects('makeRequest').once()
              .withArgs(request_type, endpoint)
              .returns(Promise.resolve(resp))
          })

          it('should not set cached_req_info to resp', (done) => {
            req.fetchRequestInfo().then((api_resp) => {
              expect(api_resp).to.eql(resp.body)
              expect(req.cached_req_info).to.eql(undefined)
              done()
            })
          })
        })
      })
    })
  })

  describe('#fetchStatus', () => {
    context('#fetchRequestInfo throws an error', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        let info = Promise.reject('SomeError')
        mock.expects('fetchRequestInfo').once().returns(info)
      })

      it('should not suppress it', (done) => {
        req.fetchStatus().catch((err) => {
          expect(err).to.eql('SomeError')
          done()
        })
      })
    })

    context('#fetchRequestInfo resolved to info', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        let info = Promise.resolve({status: 'some_status'})
        mock.expects('fetchRequestInfo').once().returns(info)
      })

      it('should resolve to #fetchRequestInfo.status', (done) => {
        req.fetchStatus().then((status) => {
          expect(status).to.eql('some_status')
          done()
        })
      })
    })
  })

  describe('#didFinish', () => {
    context('#fetchStatus is "complete"', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('fetchStatus').once()
          .returns(Promise.resolve('complete'))
      })

      it('should resolve', (done) => {
        req.didFinish().then(done)
      })
    })

    context('#fetchStatus is "error"', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('fetchStatus').once()
          .returns(Promise.resolve('error'))
      })

      it('should resolve', (done) => {
        req.didFinish().then(done)
      })
    })

    context('#fetchStatus is not "complete" or "error"', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('fetchStatus').once()
          .returns(Promise.resolve('processing'))
      })

      it('should reject', (done) => {
        req.didFinish().catch(done)
      })
    })

    context('#fetchStatus threw an error', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('fetchStatus').once()
          .returns(Promise.reject('SomeError'))
      })

      it('should not suppress it', (done) => {
        req.didFinish().catch((err) => {
          expect(err).to.eql('SomeError')
          done()
        })
      })
    })
  })

  describe('#didFindProfile', () => {
    context('#didFinish threw an error', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('didFinish').once()
          .returns(Promise.reject('SomeError'))
      })

      it('should not suppress it', (done) => {
        req.didFindProfile().catch((err) => {
          expect(err).to.eql('SomeError')
          done()
        })
      })
    })

    context('#didFinish resolved', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)
        mock.expects('didFinish').once()
          .returns(Promise.resolve())
      })

      context('#fetchRequestInfo threw an error', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)
          mock.expects('fetchRequestInfo').once()
            .returns(Promise.reject('SomeFetchError'))
        })

        it('should not suppress it', (done) => {
          req.didFindProfile().catch((err) => {
            expect(err).to.eql('SomeFetchError')
            done()
          })
        })
      })

      context('#fetchRequestInfo returned error status', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)
          let info = {status: 'error'}

          mock.expects('fetchRequestInfo').once()
            .returns(Promise.resolve(info))
        })

        it('should reject', (done) => {
          req.didFindProfile().catch(done)
        })
      })

      context('#fetchRequestInfo returned req_info.data.info.error', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)
          let info = {status: 'complete', data: {info: {error: 'some_error'}}}

          mock.expects('fetchRequestInfo').once()
            .returns(Promise.resolve(info))
        })

        it('should reject', (done) => {
          req.didFindProfile().catch(done)
        })
      })


      context('#fetchRequestInfo returned no errors', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)
          let info = {status: 'complete', data: {info: {}}}

          mock.expects('fetchRequestInfo').once()
            .returns(Promise.resolve(info))
        })

        it('should reject', (done) => {
          req.didFindProfile().then(done)
        })
      })
    })
  })

  describe('#profileInfo', () => {
    context('#didFindProfile threw error', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)

        mock.expects('didFindProfile').once()
          .returns(Promise.reject('SomeError'))
      })

      it('should not suppress error', (done) => {
        req.profileInfo().catch((err) => {
          expect(err).to.eql('SomeError')
          done()
        })
      })
    })

    context('#didFindProfile resolved', () => {
      beforeEach(() => {
        let mock = sinon.mock(req)

        mock.expects('didFindProfile').once()
          .returns(Promise.resolve())
      })

      context('#fetchRequestInfo threw error', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)

          mock.expects('fetchRequestInfo').once()
            .returns(Promise.reject('SomeFetchError'))
        })

        it('should not suppress error', (done) => {
          req.profileInfo().catch((err) => {
            expect(err).to.eql('SomeFetchError')
            done()
          })
        })
      })

      context('#fetchRequestInfo resolved with info', () => {
        beforeEach(() => {
          let mock = sinon.mock(req)
          let req_info = {data: {
            info: {some: 'info'},
            recommendations: {some: 'recs'}
          }}

          mock.expects('fetchRequestInfo').once()
            .returns(Promise.resolve(req_info))
        })


        it('should resolve with extracted info', (done) => [
          req.profileInfo().then((info) => {
            expect(info.info).to.eql({some: 'info'})
            expect(info.recommendations).to.eql({some: 'recs'})
            done()
          })
        ])
      })
    })
  })
})
