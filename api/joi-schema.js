const Joi = require('@hapi/joi');

const schema= Joi.object({
    username: Joi.string()
                .regex(/^[a-zA-Z0-9 ]*$/)
                .allow('')
                .max(20),
  
    
    room: Joi.string()
            .regex(/^[a-zA-Z0-9 ]*$/)
            .min(4)
            .max(20),
  
    password: Joi.string()
                .allow('')
                .max(20),
  
    message: Joi.string()
                .min(1)
                .max(255),
  })

module.exports = schema;