import createError from 'create-error'

export const InitialRequestTimeoutError = createError('CrystalSDK.Profile.InitialRequestTimeoutError')
export const NotFoundError = createError('CrystalSDK.Profile.NotFoundError')
export const NotFoundYetError = createError('CrystalSDK.Profile.NotFoundYetError')
export const NotAuthedError = createError('CrystalSDK.Profile.NotAuthedError')
export const RateLimitHitError = createError('CrystalSDK.Profile.RateLimitHitError')
