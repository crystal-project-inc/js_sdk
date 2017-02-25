import BaseSDK from '../base'
import ApiSDK from '../api'
import Promise from 'bluebird'

class ProfileRequest extends BaseSDK {
  constructor(id) {
    super()

    this.id = id
  }

  static fromSearch(query) {
    return ApiSDK.makeRequest('post', 'profile_search/async', query)
      .then((resp) => {
        return new ProfileRequest(resp.body.request_id)
      })
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
  }

  fetchStatus() {
    return this.fetchRequestInfo()
      .then((req_info) => req_info.status)
  }

  didFinish() {
    return this.fetchStatus()
      .then((status) => {
        if(status == 'complete' || status == 'error') return Promise.resolve()
        else return Promise.reject()
      })
  }

  didFindProfile() {
    return this.didFinish()
      .then(() => this.fetchRequestInfo())
      .then((req_info) => {
        if(req_info.status != 'complete') return Promise.reject()
        if(req_info.data.info.error) return Promise.reject()

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

export default ProfileRequest
