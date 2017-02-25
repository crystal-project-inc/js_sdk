import { expect, assert } from 'chai'
import ProfileSDK from '../../src/profile'
import ProfileRequestSDK from '../../src/profile/request'
import ApiSDK from '../../src/api'
import sinon from 'sinon'
import nock from 'nock'

nock.disableNetConnect()

describe('ProfileSDK', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('initialize', () => {
    it('should set the correct properties', () => {
      let profile = new ProfileSDK('info', 'recommendations')

      expect(profile.info).to.eql('info')
      expect(profile.recommendations).to.eql('recommendations')
    })
  })

  describe('.search', () => {
    let req
    beforeEach(() => {
      req = new ProfileSDK.Request('id')
      sandbox.stub(ProfileSDK.Request, 'fromSearch')
        .returns(Promise.resolve(req))
    })

    it('should utilize ProfileSDK.Request', (done) => {
      let mock = sinon.mock(req)
      mock.expects("didFinish").once().returns(Promise.resolve())
      mock.expects("didFindProfile").once().returns(Promise.resolve())
      mock.expects("profileInfo").once().returns(Promise.resolve({
        info: 'some_info',
        recommendations: 'some_recs'
      }))

      ProfileSDK.search({}).then((resp) => {
        expect(resp).to.be.an.instanceOf(ProfileSDK)
        expect(resp.info).to.eql('some_info')
        expect(resp.recommendations).to.eql('some_recs')
        done()
      }).catch((err) => console.log(err))
    })

    context('ran out of time', () => {
      it('should throw NotFoundYetError', (done) => {
        let mock = sinon.mock(req)
        mock.expects("didFinish").returns(Promise.reject())

        ProfileSDK.search({}, 0.01).catch((resp) => {
          expect(resp).to.eql(ProfileSDK.NotFoundYetError)
          done()
        })
      })
    })

    context('request.fromSearch threw error', () => {
      it('should throw error', (done) => {
        let mock = sinon.mock(ProfileSDK.Request)
        ProfileSDK.Request.fromSearch.restore()
        mock.expects("fromSearch")
          .once()
          .returns(Promise.reject('SomeError'))

        ProfileSDK.search({}).catch((resp) => {
          expect(resp).to.eql('SomeError')
          done()
        })
      })
    })

    context('request.didFinish threw error', () => {
      it('should throw error', (done) => {
        let mock = sinon.mock(req)
        mock.expects("didFinish")
          .once()
          .returns(Promise.reject('SomeFinishError'))

        ProfileSDK.search({}).catch((resp) => {
          expect(resp).to.eql('SomeFinishError')
          done()
        })
      })
    })

    context('request.didFindProfile rejected', () => {
      it('should throw NotFoundError', (done) => {
        let mock = sinon.mock(req)
        mock.expects('didFinish').once().returns(Promise.resolve())
        mock.expects("didFindProfile")
          .once()
          .returns(Promise.reject())

        ProfileSDK.search({}).catch((resp) => {
          expect(resp).to.eql(ProfileSDK.NotFoundError)
          done()
        })
      })
    })

    context('request.profileInfo threw error', () => {
      it('should throw error', (done) => {
        let mock = sinon.mock(req)
        mock.expects('didFinish').once().returns(Promise.resolve())
        mock.expects('didFindProfile').once().returns(Promise.resolve())
        mock.expects("profileInfo")
          .once()
          .returns(Promise.reject('SomeError'))

        ProfileSDK.search({}).catch((resp) => {
          expect(resp).to.eql('SomeError')
          done()
        })
      })
    })

    context('successfully got request', () => {
      beforeEach(() => {
        ProfileSDK.Request.fromSearch.restore()
        sinon.stub(ProfileSDK.Request, 'fromSearch')
          .returns(Promise.resolve(new ProfileSDK.Request('an_id')))
      })

      context('ApiSDK threw error while processing request', () => {
        context('error is 401', () => {
          beforeEach(() => {
            let error = {statusCode: 401}
            sandbox.stub(ApiSDK, 'makeRequest')
              .returns(Promise.reject(error))
          })

          it('should throw NotAuthedError', (done) => {
            ProfileSDK.search({}).catch((err) => {
              expect(err).to.eql(ProfileSDK.NotAuthedError)
              done()
            })
          })
        })

        context('error is 404', () => {
          beforeEach(() => {
            let error = {statusCode: 404}
            sandbox.stub(ApiSDK, 'makeRequest')
              .returns(Promise.reject(error))
          })

          it('should throw NotFoundError', (done) => {
            ProfileSDK.search({}).catch((err) => {
              expect(err).to.eql(ProfileSDK.NotFoundError)
              done()
            })
          })
        })

        context('error is unexpected', () => {
          beforeEach(() => {
            sandbox.stub(ApiSDK, 'makeRequest')
              .returns(Promise.reject('SomeError'))
          })

          it('should not suppress error', (done) => {
            ProfileSDK.search({}).catch((err) => {
              expect(err).to.eql('SomeError')
              done()
            })
          })
        })
      })
    })

    context('ApiSDK threw error when getting request', () => {
      context('error is 401', () => {
        beforeEach(() => {
          let error = {statusCode: 401}
          sandbox.stub(ApiSDK, 'makeRequest')
            .returns(Promise.reject(error))
        })

        it('should throw NotAuthedError', (done) => {
          ProfileSDK.search({}).catch((err) => {
            expect(err).to.eql(ProfileSDK.NotAuthedError)
            done()
          })
        })
      })

      context('error is 429', () => {
        beforeEach(() => {
          let error = {statusCode: 429}
          sandbox.stub(ApiSDK, 'makeRequest')
            .returns(Promise.reject(error))
        })

        it('should throw RateLimitHitError', (done) => {
          ProfileSDK.search({}).catch((err) => {
            expect(err).to.eql(ProfileSDK.RateLimitHitError)
            done()
          })
        })
      })

      context('error is unexpected', () => {
        beforeEach(() => {
          sandbox.stub(ApiSDK, 'makeRequest')
            .returns(Promise.reject('SomeError'))
        })

        it('should not suppress error', (done) => {
          ProfileSDK.search({}).catch((err) => {
            expect(err).to.eql('SomeError')
            done()
          })
        })
      })
    })
  })

  describe('.Request', () => {
    it('should be ProfileRequestSDK', () => {
      expect(ProfileSDK.Request).to.eql(ProfileRequestSDK)
    })
  })

  describe('.NotFoundError', () => {
    it('should exist', () => {
      expect(ProfileSDK.NotFoundError).to.exist
    })
  })

  describe('.NotFoundYetError', () => {
    it('should exist', () => {
      expect(ProfileSDK.NotFoundYetError).to.exist
    })
  })

  describe('.NotAuthedError', () => {
    it('should exist', () => {
      expect(ProfileSDK.NotAuthedError).to.exist
    })
  })

  describe('.RateLimitHitError', () => {
    it('should exist', () => {
      expect(ProfileSDK.RateLimitHitError).to.exist
    })
  })
})
