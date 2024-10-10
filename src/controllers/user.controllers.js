const catchError = require('../utils/catchError');
const { getAllServices, createServices, getOneServices, deleteServices, updateServices } = require('../services/user.services');
const EmailCode = require('../models/EmailCode');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

const getAll = catchError(async (req, res) => {
  const results = await getAllServices();
  return res.json(results);
});

const create = catchError(async (req, res, next) => {
  const result = await createServices({ ...req.body, password: req.hashPassword });

  req.result = result
  next()

});

const getOne = catchError(async (req, res, next) => {
  const { id } = req.params;
  const result = await getOneServices(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await deleteServices(id)
  if (!result) return res.sendStatus(404);
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { id } = req.params;

  const fieldToDelete = ['password', 'email', 'isVerified']

  fieldToDelete.forEach(field => {
    delete req.body[field]
  })

  const result = await updateServices(req.body, id)
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});


const login = catchError(async (req, res) => {
  const user = req.userlogged
  const token = req.token
  return res.json({ user, token })
})


const logged = catchError(async (req, res) => {
  const user = req.user
  return res.json(user)
})

const userVerified = catchError(async (req, res) => {
  const { code } = req.params

  const result = await EmailCode.findOne({ where: { code } })
  const user = await User.findByPk(result.userId)
  if (!user) return res.sendStatus(404)

  const userUpdate = await user.update({ isVerified: true })
  await result.destroy()

  return res.json(userUpdate)
})

const resetPassword = catchError(async(req, res) => {
  const { email, frontBaseUrl } = req.body 
 
  //BUSCAMOS AL USUARIO
  const user = await User.findOne({where: { email}})
  if (!user) return res.status(401).json({ error : "user not found"})

  const code = require('crypto').randomBytes(64).toString('hex')

  //GUARDAMOS EN LA BASE DE DATOS
  await EmailCode.create({ code, userId: user.id})

  const firstName = user.firstName

  //SEND EMAIL
  sendEmail({
    to: email,
    subject: 'update password',
    html: `
      <div style="max-width: 500px; margin: 50px auto; background-color: #f8fafc; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: 'Arial', sans-serif; color: #333333;">
        
        <h1 style="color: #007BFF; font-size: 28px; text-align: center; margin-bottom: 20px;">¡Hola ${firstName.toUpperCase()} 👋!</h1>    
        
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; text-align: center;">Para actualizar lacontraseña, por favor haga click en el siguiente enlace:</p>
        
        <div style="text-align: center;">
            <a href="${frontBaseUrl}/reset_password/${code}" style="display: inline-block; background-color: #007BFF; color: #ffffff; text-align: center; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">¡Upadte Pssword!</a>
        </div>

      </div>
    `
  })

  return res.json(user)
})

const updatePassword = catchError(async(req, res) => {
  const { code } = req.params
  const { password } = req.body

  const emailCode = await EmailCode.findOne( {where: { code }})
  if(!emailCode) return res.status(401).json({ error : "user not found"})

  const user = await User.findByPk(emailCode.userId)

  const newPassword = await bcrypt.hash(password, 10)

  const userUpdate = await user.update({
    password: newPassword
  })

  await emailCode.destroy()
  //await EmailCode.destroy({where:{id:emailCode.id}})

  return res.json(userUpdate)
})

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  logged,
  userVerified,
  resetPassword,
  updatePassword
}