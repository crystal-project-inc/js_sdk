import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
import * as Errors from './errors'
import Promise from 'bluebird'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_POLLS = 10

class ProfileSDK extends BaseSDK {
  constructor(info, recommendations) {
    super()

    this.info = info
    this.recommendations = recommendations
  }

  static fromRequest(request) {
    return request.profileInfo()
      .then((pd) => new ProfileSDK(pd.info, pd.recommendations))
  }

  static search(query, timeout = 30) {
    let pollsLeft = MAX_POLLS

    const poll = (searchReq) => {
      if(!pollsLeft || pollsLeft <= 0) {
        const error = new ProfileSDK.NotFoundYetError(
          `Profile not found within time limit: ${searchReq.id}`,
          {request: searchReq}
        )

        throw error
      }
      pollsLeft -= 1

      return searchReq.didFinish()
        .then((finished) => (
          finished ?
          ProfileSDK.fromRequest(searchReq) :
          sleep((timeout / MAX_POLLS) * 1000).then(() => poll(searchReq))
        ))
    }


    return ProfileSDK.Request.fromSearch(query)
      .then(poll)
  }
}

ProfileSDK.Request = RequestSDK

ProfileSDK.InitialRequestTimeoutError = Errors.InitialRequestTimeoutError
ProfileSDK.NotFoundError = Errors.NotFoundError
ProfileSDK.NotFoundYetError = Errors.NotFoundYetError
ProfileSDK.NotAuthedError = Errors.NotAuthedError
ProfileSDK.RateLimitHitError = Errors.RateLimitHitError

export default ProfileSDK
