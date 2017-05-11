import { expect, assert } from 'chai'
import EmailSampleSDK from '../../src/email_sample'
import Errors from '../../src/errors'
import ApiSDK from '../../src/api'
import sinon from 'sinon'
import nock from 'nock'

nock.disableNetConnect()

describe('EmailSample', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('.all', () => {
    let req
    beforeEach(() => {
      req = [{ text: "sample email" }]
      sandbox.stub(EmailSampleSDK, 'all')
        .returns(Promise.resolve(req))
    })

    it('return email samples', (done) => {
      EmailSampleSDK.all({request_id: 'RequestId'}).then((resp) => {
        expect(resp).to.eql(req)
        done()
      }).catch((err) => console.log(err))
    })
  })
})

