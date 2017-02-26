import BaseSDK from '../base'
import ApiSDK from '../api'
import * as Errors from './errors'
import Promise from 'bluebird'
import createError from 'create-error'

class ProfileRequestSDK extends BaseSDK {
  constructor(id) {
    super()

    this.id = id
  }

  static fromSearch(query) {
    return ApiSDK.makeRequest('post', 'profile_search/async', query)
      .then((resp) => {
        return new ProfileRequestSDK(resp.body.request_id)
      })
      .catch(ProfileRequestSDK.checkError)
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

  fetchRequestInfo() {
    if(this.cached_req_info) return Promise.resolve(this.cached_req_info)

    return ApiSDK.makeRequest('get', `results/${this.id}`)
      .then((resp) => {
        const body = resp.body
        if(body.status == 'complete' || body.status == 'error') {
          this.cached_req_info = body
        }

        return body
      })
      .catch(ProfileRequestSDK.checkError)
  }

  fetchStatus() {
    return this.fetchRequestInfo()
      .then((req_info) => req_info.status)
  }

  didFinish() {
    return this.fetchStatus()
      .then((status) => {
        if(status == 'complete' || status == 'error') return Promise.resolve()
        else return Promise.reject(new ProfileRequestSDK.NotFinishedError())
      })
  }

  didFindProfile() {
    return this.didFinish()
      .then(() => this.fetchRequestInfo())
      .then((req_info) => {
        if(req_info.status != 'complete') return Promise.reject(new ProfileRequestSDK.RequestStatusError())
        if(req_info.data.info.error) return Promise.reject(new ProfileRequestSDK.ProfileInfoError())

        return Promise.resolve()
      })
  }

  profileInfo() {
    return this.didFindProfile()
      .then(() => this.fetchRequestInfo())
      .then((req_info) => {
        const profile_info = req_info.data.info
        const recommendations = req_info.data.recommendations

        return {info: profile_info, recommendations: recommendations}
      })
  }
}

ProfileRequestSDK.NotFinishedError = createError('CrystalSDK.Profile.Request.NotFinishedError')
ProfileRequestSDK.RequestStatusError = createError('CrystalSDK.Profile.Request.RequestStatusError')
ProfileRequestSDK.ProfileInfoError = createError('CrystalSDK.Profile.Request.ProfileInfoError')

export default ProfileRequestSDK
