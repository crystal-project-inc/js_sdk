import BaseSDK from './base'
import * as APIConstants from './constants/api'
import rp from 'request-promise'
import Promise from 'bluebird'

let _OrgToken = null

class ApiSDK extends BaseSDK {
  static makeRequest(method, endpoint, params = {}, headers = {}) {
    headers['X-Org-Token'] = this.fetchOrgToken()
    headers['X-Sdk-Version'] = APIConstants.SDK_VERSION

    let options = {
      method: method,
      url: `${APIConstants.API_BASE_URL}/${endpoint}`,
      body: params,
      headers: headers,
      json: true,
      resolveWithFullResponse: true
    }

    return rp(options)
      .then((resp) => Promise.resolve(resp))
      .catch((err) => Promise.reject(err))
  }

  static get OrgToken() { return _OrgToken }
  static set OrgToken(val) { _OrgToken = val }
  static fetchOrgToken() {
    if(!_OrgToken) throw ApiSDK.ApiKeyNotSet

    return _OrgToken
  }
}

ApiSDK.ApiKeyNotSet = 'CrystalSDK.Api.ApiKeyNotSet'

export default ApiSDK
