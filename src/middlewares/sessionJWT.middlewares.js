const jwt = require('jsonwebtoken')

const sessionJWT = (req, res, next) => {

  const user = req.userlogged

  const token = jwt.sign(
    { user },
    process.env.TOKEN_SECRET,
    { expiresIn: '1d' }
  )

  req.token = token
  next()

}

module.exports = sessionJWT
