const usersRouter = require('express').Router(); // importar el router de express
const User = require('../models/user'); // importar el modelo de usuario
const bcrypt = require('bcrypt'); // libreria para hashear contraseñas
const jwt = require('jsonwebtoken'); // libreria para crear y verificar tokens
const nodemailer = require('nodemailer'); // libreria para enviar correos
const { PAGE_URL } = require('../config'); // importar la url de la pagina desde config

// POST para crear un nuevo usuario
usersRouter.post('/', async (request, response) => {
    const { name, email, password } = request.body; 
    console.log('datos recibidos en el backend:', name, email, password);
    
    if (!name || !email || !password) {
        return response.status(400).json({ error: 'todos los espacios son requeridos' });
    } 

    const userexists = await User.findOne({ email: email.toLowerCase() });
    if (userexists) {
        return response.status(400).json({ error: 'el correo ya esta en uso' });
    }
    
    const saltRounds = 10;  
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
    });

    // Guardar el usuario en la base de datos
    const saveUser = await newUser.save(); 
    console.log('usuario guardado:', saveUser);
    
    const token = jwt.sign({ id: saveUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }); 
    console.log('token generado:', token);
    
    // Configurar el transporte de nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS,
        },
    });

    // Enviar el correo de verificación
    await transporter.sendMail({ 
        from: process.env.EMAIL_USER, 
        to: saveUser.email,  
        subject: 'Verificacion de usuario',
        html: `<a href="${PAGE_URL}/verify/${saveUser.id}/${token}">Verificar correo</a>`, 
    });
    
    return response.status(201).json('Usuario creado. Por favor verifica tu correo');
});

// PATCH para verificar el correo electrónico del usuario
usersRouter.patch('/:id/:token', async (request, response) => {
    try {
        const token = request.params.token; 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const id = decodedToken.id;
        await User.findByIdAndUpdate(id, { verified: true });
        
        return response.sendStatus(200);

    } catch (error) {
        // Si el token expiró, encontrar el email del usuario    
        const id = request.params.id;
        const { email } = await User.findById(id);
        
        // Firmar un nuevo token
        const newToken = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
        console.log('nuevo token generado:', newToken);

        // Configurar y enviar el correo de nuevo
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificacion de usuario (Nuevo Link)',
            html: `<a href="${PAGE_URL}/verify/${id}/${newToken}">Verificar correo</a>`, 
        });

        return response.status(400).json({ error: 'El link ya ha expirado. Se ha enviado un nuevo link de verificación a su correo' });
    }
});

// GET (NUEVO) para verificar la sesión activa y obtener el rol del usuario
usersRouter.get('/me', async (request, response) => {
    try {
        // Leemos la cookie llamada accessToken
        const token = request.cookies?.accessToken;
        
        if (!token) {
            return response.status(401).json({ error: 'No hay sesión activa' });
        }

        // Verificamos que el token sea válido
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Buscamos al usuario en la base de datos
        const user = await User.findById(decodedToken.id);
        
        if (!user) {
            return response.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Devolvemos nombre, email y rol para manipular la vista del store
        return response.status(200).json({ 
            name: user.name, 
            email: user.email, 
            rol: user.rol 
        });

    } catch (error) {
        return response.status(401).json({ error: 'Token inválido o expirado' });
    }
});

// POST para cerrar sesión
usersRouter.post('/logout', async (request, response) => {
    try {
        // Borramos la cookie que contiene el token
        response.clearCookie('accessToken');
        return response.status(200).json({ message: 'Sesión cerrada con éxito' });
    } catch (error) {
        return response.status(500).json({ error: 'Hubo un error al cerrar sesión' });
    }
});

// Exportar el router
module.exports = usersRouter;