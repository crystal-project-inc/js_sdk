Crystal Javascript SDK
======================
[![CircleCI branch](https://img.shields.io/circleci/project/crystal-project-inc/sdk/master.svg)]()
[![codecov.io](https://codecov.io/github/crystal-project-inc/sdk/coverage.svg?branch=master)](https://codecov.io/github/crystal-project-inc/sdk?branch=master)

Provides access to Crystal, the world's largest and most accurate personality database!

Here's how you use it:

```js
CrystalSDK.key = "OrgApiKey"

CrystalSDK.Profile.search({
  first_name: "Drew",
  last_name: "D'Agostino",
  email: "drew@crystalknows.com"
})
  .then((profile) => {
    console.log("Profile found!")
    console.log("First Name:", profile.info.first_name)
    console.log("Last Name:", profile.info.last_name)
    console.log("Predicted DISC Type:", profile.info.disc_type)
    console.log("Prediction Confidence:", profile.info.confidence)
    console.log("Personality Overview:", profile.info.overview)

    console.log("Recommendations:", profile.recommendations)

  })
  .catch(CrystalSDK.Profile.NotFoundYetError, (err) => {
    console.log("Profile was not found before time limit was reached")

  })
  .catch(CrystalSDK.Profile.NotFoundError, (err) => {
    console.log("Profile was not found")

  })
  .catch(CrystalSDK.Profile.NotAuthedError, (err) => {
    console.log("The organization name or token given was not valid")

  })
  .catch((err) => {
    console.log("Unexpected Error:", err)

  })
```
