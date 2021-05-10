const Joi = require("joi");

const email = Joi.string()
    .email()
    .max(30).messages({
        'any.only': "email must be a valid email",
    })
    .required();
const username = Joi.string()
    .alphanum()
    .min(3)
    .max(30).messages({
        'any.only': "username must only contain alpha-numeric characters"
    })
    .required();
const message =
    "password must be between 8-16 characters, " +
    "have at least one capital letter, " +
    "one lowercase letter, one digit, " +
    "and one special character";
const password = Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/)
    .messages({
        'any.only': message,
        'string.pattern.base': message
    });

const confirmPassword = Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords does not match',
});

const signUp = Joi.object().keys({
    email,
    username,
    password,
    confirmPassword
});

const signIn = Joi.object().keys({
    email,
    password
});

const updatePassword = Joi.object().keys({
    password,
    confirmPassword
});

const Email = Joi.object().keys({
    email
});

module.exports.Email = Email;
module.exports.updatePassword = updatePassword;
module.exports.signIn = signIn;
module.exports.signUp = signUp;
module.exports.confirmPassword = confirmPassword;