const { getAll, create, getOne, remove, update, login, logged, userVerified, resetPassword, updatePassword } = require('../controllers/user.controllers');
const express = require('express');
const hashPassword = require('../middlewares/hashPassword.middlewares');
const loginMiddelwares = require('../middlewares/login.middlewares');
const sessionJWT = require('../middlewares/sessionJWT.middlewares');
const verifyJWT = require('../utils/verifyJwt');
const emailCode = require('../middlewares/emailCode.middlewares');

const routerUser = express.Router();

//estaticas
routerUser.route('/')
  .get(verifyJWT, getAll)
  .post(hashPassword, create, emailCode)

routerUser.route('/login')
  .post(loginMiddelwares, sessionJWT, login)

routerUser.route('/me')
  .get(verifyJWT, logged)

routerUser.route('/reset_password')
  .post(resetPassword)

//estaticas - dinamicas
routerUser.route('/verify/:code')
  .get(userVerified)

routerUser.route('/reset_password/:code')
  .post(updatePassword)

//dinamicas
routerUser.route('/:id')
  .get(verifyJWT, getOne)
  .delete(verifyJWT, remove)
  .put(verifyJWT, update);

module.exports = routerUser;