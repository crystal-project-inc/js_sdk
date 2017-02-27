import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
import * as Errors from './errors'
import Promise from 'bluebird'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const POLL_PAUSE_IN_SECONDS = 2

class ProfileSDK extends BaseSDK {
  constructor(info, recommendations) {
    super()

    this.info = info
    this.recommendations = recommendations
  }

  static search(query, timeout = 30) {
    const PAUSE_IN_SECS = 3

    let req
    let timedOut = new Promise((resolve, reject) => {
      setTimeout(() => {
        if(req) {
          const error = new ProfileSDK.NotFoundYetError(
            `Profile not found within time limit: ${req.id}`,
            {request: req}
          )

          reject(error)
        } else reject(new ProfileSDK.InitialRequestTimeoutError())
      }, timeout * 1000)
    })

    const poll = (searchReq) => {
      req = searchReq

      return searchReq.didFinish()
        .then((finished) => (
          finished ?
          searchReq.profileInfo() :
          sleep(PAUSE_IN_SECS * 1000).then(() => poll(searchReq))
        ))
    }


    const searchPromise = ProfileSDK.Request.fromSearch(query)
      .then(poll)
      .then((pd) => new ProfileSDK(pd.info, pd.recommendations))

    return Promise.race([searchPromise, timedOut])
  }
}

ProfileSDK.Request = RequestSDK

ProfileSDK.InitialRequestTimeoutError = Errors.InitialRequestTimeoutError
ProfileSDK.NotFoundError = Errors.NotFoundError
ProfileSDK.NotFoundYetError = Errors.NotFoundYetError
ProfileSDK.NotAuthedError = Errors.NotAuthedError
ProfileSDK.RateLimitHitError = Errors.RateLimitHitError

export default ProfileSDK
