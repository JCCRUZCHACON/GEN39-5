const EmailCode = require("./EmailCode");
const User = require("./User");

// ! RELACIONES DE UNO A UNO
User.hasOne(EmailCode)
EmailCode.belongsTo(User)