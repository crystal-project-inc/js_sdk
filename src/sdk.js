import ApiSDK from './api'
import Profile from './profile'
import EmailSample from './email_sample'
import Errors from './errors'

class SDK {
  static get key() { return ApiSDK.OrgToken }
  static set key(val) { ApiSDK.OrgToken = val }
}

if(process && process.env && process.env.CRYSTAL_KEY) {
  SDK.key = process.env.CRYSTAL_KEY
}

SDK.Profile = Profile
SDK.EmailSample = EmailSample
SDK.Errors = Errors

module.exports = SDK

