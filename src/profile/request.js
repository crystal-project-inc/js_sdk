import BaseSDK from '../base'
import ApiSDK from '../api'
import * as Errors from './../errors'
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
      .catch(Errors.checkError)
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
      .catch(Errors.checkError)
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
