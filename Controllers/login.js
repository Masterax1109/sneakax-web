const loginRouter = require('express').Router();
const { request } = require('node:http');
const user = require('../models/user');
const { response } = require('../app');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

loginRouterRouter.post('/', async (request,response) => {
    const {email, password} = request.body;
    //COMPRUEBA USUARIO EN LA BASE DE DATOS
    const userExist = UserActivation.findOne({email})
    console.log(userExist);

    if (!userExist) {
        return response.status(400).json({ error: 'email o contraseña invalidos'});

    }

    if (userExist.verified){
        return response.status(400).json({ error: 'tu email no está verificado'});
    }

    const isCorrect = await bcrypt.compare(password, userExist.passwordHash);

    if(!isCorrect) {
        return response.status(400).json({ error: 'email o contraseña invalidos'});
    }

    const userForToken = {
        id: userExist.id,

    }

    const accesToken = jwt.sing(userForToken, process.env.ACCES_TOKEN_SECRET, {
        expiresIn: '1d'
    });

    response.cookie('accessToken', accesToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        secure: process.env.NODE_ENV === 'production',
        httpOnly : true
    });

    return response.sendStatus(200);


});

module.exports = loginRouter;