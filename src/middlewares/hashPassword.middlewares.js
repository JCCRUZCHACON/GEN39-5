const bcrypt = require("bcrypt")

async function hashPassword(req, res, next) {

  const { password } = req.body
  const hashPassword = await bcrypt.hash(password, 10)

  req.hashPassword = hashPassword
  next()
}

module.exports = hashPassword