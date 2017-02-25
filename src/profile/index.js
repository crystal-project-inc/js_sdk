import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
import Promise from 'bluebird'
import createError from 'create-error'

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
                  return Promise.reject(err)
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
      .catch((err) => {
        switch(err.statusCode) {
          case 401:
            throw new ProfileSDK.NotAuthedError(
              `Org Token Invalid: ${ApiSDK.OrgToken}`,
              {token: ApiSDK.OrgToken}
            )
          case 404:
            throw new ProfileSDK.NotFoundError()
          case 429:
            throw new ProfileSDK.RateLimitHitError()
          default:
            throw err
        }
      })
  }
}

ProfileSDK.Request = RequestSDK

ProfileSDK.InitialRequestTimeoutError = createError('CrystalSDK.Profile.InitialRequestTimeoutError')

ProfileSDK.NotFoundError = createError('CrystalSDK.Profile.NotFoundError')

ProfileSDK.NotFoundYetError = createError('CrystalSDK.Profile.NotFoundYetError')

ProfileSDK.NotAuthedError = createError('CrystalSDK.Profile.NotAuthedError')

ProfileSDK.RateLimitHitError = createError('CrystalSDK.Profile.RateLimitHitError')

export default ProfileSDK
