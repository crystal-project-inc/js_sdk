import ApiSDK from './api'
import createError from 'create-error'

export const InitialRequestTimeoutError = createError('CrystalSDK.Errors.InitialRequestTimeoutError')
export const NotFoundError = createError('CrystalSDK.Errors.NotFoundError')
export const NotFoundYetError = createError('CrystalSDK.Errors.NotFoundYetError')
export const NotAuthedError = createError('CrystalSDK.Errors.NotAuthedError')
export const RateLimitHitError = createError('CrystalSDK.Errors.RateLimitHitError')

class Errors {
  constructor() {}

  static checkError(err) {
    switch(err.statusCode) {
      case 401:
        throw new NotAuthedError(
          `Org Token Invalid: ${ApiSDK.OrgToken}`,
          {token: ApiSDK.OrgToken}
        )
      case 404:
        throw new NotFoundError()
      case 429:
        throw new RateLimitHitError()
      default:
        throw err
    }
  }
}

Errors.InitialRequestTimeoutError = InitialRequestTimeoutError
Errors.NotFoundError = NotFoundError
Errors.NotFoundYetError = NotFoundYetError
Errors.NotAuthedError = NotAuthedError
Errors.RateLimitHitError = RateLimitHitError

export default Errors

