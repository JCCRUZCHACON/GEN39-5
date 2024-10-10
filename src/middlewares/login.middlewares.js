const bcrypt = require("bcrypt")
const User = require("../models/User")

async function loginMiddelwares(req, res, next) {
  const { email, password } = req.body

  const user = await User.findOne({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Credentials invalid' })

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) return res.status(401).json({ message: 'Credentials invalid' })


  if (user.isVerified === 'false') return res.status(401).json({ message: 'isVerified:false' })
    
  req.userlogged = user

  next()

}

module.exports = loginMiddelwares