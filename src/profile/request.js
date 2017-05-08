import BaseSDK from '../base'
import ApiSDK from '../api'
import * as Errors from './errors'
import Promise from 'bluebird'

class ProfileRequestSDK extends BaseSDK {
  constructor(id) {
    super()

    this.id = id
  }

  static fromSearch(query) {
    return ApiSDK.makeRequest('post', 'profiles/async', query)
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

    return ApiSDK.makeRequest('get', `profiles/results/${this.id}`)
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
        if(status == 'complete' || status == 'error') return true
        else return false
      })
      .catch((err) => err instanceof Errors.NotFoundError ? true : Promise.reject(err))
  }

  didFindProfile() {
    return this.didFinish()
      .then((finished) => finished ? this.fetchRequestInfo() : false)
      .then((req_info) => {
        return req_info.status == 'complete' && !req_info.info.error
      })
      .catch((err) => err instanceof Errors.NotFoundError ? false : Promise.reject(err))
  }

  profileInfo() {
    return this.didFindProfile()
      .then(() => this.fetchRequestInfo())
      .then((req_info) => {
        const profile_info = req_info.info
        const recommendations = req_info.recommendations

        return { info: profile_info, recommendations: recommendations, id: this.id }
      })
  }
}

export default ProfileRequestSDK
