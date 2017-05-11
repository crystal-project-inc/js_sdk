
import BaseSDK from '../base'
import ApiSDK from '../api'
import * as Errors from './../errors'
import Promise from 'bluebird'

class EmailSampleSDK extends BaseSDK {
  constructor() {
    super()
  }

  static all(args={}) {
    return ApiSDK.makeRequest('get', `emails/${args.request_id}`)
      .then((resp) => {
        return resp.body;
      })
      .catch(Errors.checkError)
  }

}

export default EmailSampleSDK
