import ApiSDK from './api'
import Profile from './profile'
import EmailSample from './email_sample'

class SDK {
  static get key() { return ApiSDK.OrgToken }
  static set key(val) { ApiSDK.OrgToken = val }
}

if(process && process.env && process.env.CRYSTAL_KEY) {
  SDK.key = process.env.CRYSTAL_KEY
}

SDK.Profile = Profile
SDK.EmailSample = EmailSample

module.exports = SDK
