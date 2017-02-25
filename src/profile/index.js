import BaseSDK from '../base'
import ApiSDK from '../api'
import RequestSDK from './request'
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
    let timedOut = new Promise((resolve, reject) => {
      setTimeout(() => reject(ProfileSDK.NotFoundYetError), timeout * 1000)
    })

    const searchPromise = ProfileSDK.Request.fromSearch(query)
      .then((searchRequest) => {
        return new Promise((resolve, reject) => {
          const checkStatus = () => {
            searchRequest.didFinish()
              .catch((err) => (err ? reject(err) : sleep(2000).then(checkStatus)))
              .then(() => {
                return searchRequest.didFindProfile()
                  .catch(() => reject(ProfileSDK.NotFoundError))
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
            throw ProfileSDK.NotAuthedError
          case 404:
            throw ProfileSDK.NotFoundError
          case 429:
            throw ProfileSDK.RateLimitHitError
          default:
            throw err
        }
      })
  }
}

ProfileSDK.Request = RequestSDK

ProfileSDK.NotFoundError = "CrystalSDK.Profile.NotFoundError"
ProfileSDK.NotFoundYetError = "CrystalSDK.Profile.NotFoundYetError"
ProfileSDK.NotAuthedError = "CrystalSDK.Profile.NotAuthedError"
ProfileSDK.RateLimitHitError = "CrystalSDK.Profile.RateLimitHitError"

export default ProfileSDK
