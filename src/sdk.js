import ApiSDK from './api'
import Profile from './profile'

class SDK {
  static get key() { return ApiSDK.OrgToken }
  static set key(val) { ApiSDK.OrgToken = val }
}

if(process && process.env && process.env.CRYSTAL_KEY) {
  SDK.key = process.env.CRYSTAL_KEY
}

SDK.Profile = Profile

module.exports = SDK
