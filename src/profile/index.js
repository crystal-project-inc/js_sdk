import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
import * as Errors from './../errors'
import Promise from 'bluebird'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_POLLS = 10

class ProfileSDK extends BaseSDK {
  constructor(info, recommendations, id) {
    super()

    this.info = info
    this.recommendations = recommendations
    this.id = id
  }

  static fromRequest(request) {
    return request.profileInfo()
      .then((pd) => new ProfileSDK(pd.info, pd.recommendations, pd.id))
  }

  static search(query, timeout = 30) {
    let pollsLeft = MAX_POLLS

    const poll = (searchReq) => {
      if(!pollsLeft || pollsLeft <= 0) {
        const error = new Errors.NotFoundYetError(
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

export default ProfileSDK

