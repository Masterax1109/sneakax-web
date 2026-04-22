//requiero mongoose
const mongoose = require('mongoose');
const { verify } = require('node:crypto');
const { type } = require('node:os');

//se crea la tabla o modelo de las propiedades
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    verified: {
        type: Boolean,
        default: false
    },
    // NUEVO: Agregamos el sistema de roles
    rol: {
        type: String,
        default: 'cliente' // Por defecto, todo el que se registre será un cliente normal
    }
});

//se congigura la respuesta del usuario
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        //se borra el id
        delete returnedObject._id;
        //se borra la version
        delete returnedObject.__V;
        //se borra la contraseña para que no la entregue de nuevo encriptada
        delete returnedObject.passwordHash;

    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
