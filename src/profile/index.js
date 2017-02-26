import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
import * as Errors from './errors'
import Promise from 'bluebird'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ProfileSDK extends BaseSDK {
  constructor(info, recommendations) {
    super()

    this.info = info
    this.recommendations = recommendations
  }

  static search(query, timeout = 30) {
    let req
    let timedOut = new Promise((resolve, reject) => {
      setTimeout(() => {
        if(req) {
          const error = new ProfileSDK.NotFoundYetError(
            `Profile not found within time limit: ${req.id}`,
            {request: req}
          )

          reject(error)
        }
        else reject(new ProfileSDK.InitialRequestTimeoutError())
      }, timeout * 1000)
    })

    const searchPromise = ProfileSDK.Request.fromSearch(query)
      .then((searchRequest) => {
        req = searchRequest

        return new Promise((resolve, reject) => {
          const checkStatus = () => {
            searchRequest.didFinish()
              .catch((err) => {
                if(err instanceof ProfileSDK.Request.NotFinishedError) {
                  return sleep(2000).then(checkStatus)
                } else {
                  return reject(err)
                }
              })
              .then(() => {
                return searchRequest.didFindProfile()
                  .catch(() => reject(new ProfileSDK.NotFoundError()))
              })
              .then(() => searchRequest.profileInfo())
              .then((pd) => resolve(new ProfileSDK(pd.info, pd.recommendations)))
              .catch(reject)
          }

          checkStatus()
        })
      })

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
