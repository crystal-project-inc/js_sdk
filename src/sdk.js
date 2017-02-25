import ApiSDK from './api'
import Profile from './profile'

class SDK {
  static get key() { return ApiSDK.OrgToken }
  static set key(val) { ApiSDK.OrgToken = val }
}

SDK.Profile = Profile

module.exports = SDK
