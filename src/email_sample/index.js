
import BaseSDK from '../base'
import ApiSDK from '../api'
//import RequestSDK from './request'
import * as Errors from './errors'
import Promise from 'bluebird'

class EmailSampleSDK extends BaseSDK {
  constructor() {
    super()
  }

  static all(args={}) {
    return ApiSDK.makeRequest('post', `emails/${args.request_id}`)
      .then((resp) => {
        const body = resp.body
        console.log("BODY", body.length)
//        if(body.status == 'complete' || body.status == 'error') {
//          this.cached_req_info = body
//        }
        return body
      })
      .catch(EmailSampleSDK.checkError)
  }

  static checkError(err) {
    switch(err.statusCode) {
      case 401:
        throw new Errors.NotAuthedError(
          `Org Token Invalid: ${ApiSDK.OrgToken}`,
          {token: ApiSDK.OrgToken}
        )
      case 404:
        throw new Errors.NotFoundError()
      case 429:
        throw new Errors.RateLimitHitError()
      default:
        throw err
    }
  }
}

//EmailSampleSDK.Request = RequestSDK

EmailSampleSDK.InitialRequestTimeoutError = Errors.InitialRequestTimeoutError
EmailSampleSDK.NotFoundError = Errors.NotFoundError
EmailSampleSDK.NotFoundYetError = Errors.NotFoundYetError
EmailSampleSDK.NotAuthedError = Errors.NotAuthedError
EmailSampleSDK.RateLimitHitError = Errors.RateLimitHitError

export default EmailSampleSDK
