const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

module.exports = {
    
    show: function (req, res) {
        User.find({})
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
    },

    add: function (req, res) {
        User.findOne({email: req.body.email})
        .then(data => {
            if (data) {
                res.status(500).json({message: 'The email has been registered before.'})
            } else {
                let hashedPassword = bcrypt.hashSync(req.body.password)                
                User.create({
                    email: req.body.email,
                    password: hashedPassword
                })
                .then(() => {
                    res.status(201).json({message: 'New user added.'})
                })
                .catch(err => {
                    res.status(500).json({error: err})
                })
            }
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
    },

    edit: function (req, res) {
        let hashedPassword = bcrypt.hashSync(req.body.password)
        User.updateOne({
            _id: req.params.id
        }, {
            email: req.body.email,
            password: hashedPassword
        })
        .then(() => {
            res.status(200).json({message: `User ${req.params.id} updated.`})
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
    },

    remove: function (req, res) {
        User.deleteOne({
            _id: req.params.id
        })
        .then(() => {
            res.status(200).json({message: `User '${req.params.id}' deleted.`})
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
    },

    login: function (req, res) {
        if(!req.body.email || !req.body.password) {
            res.status(500).json({message: 'You should input your email and password to log in'})
        } else {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if(user) {
                    if (user.gSignIn === 0) {
                        let passwordValid = bcrypt.compareSync(req.body.password.toString(), user.password)
                        if(passwordValid) {
                            let token = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.JWT_KEY);
                            res.status(200).json({token: token})
                        } else {
                            res.status(500).json({message: 'Wrong password'})
                        }
                    } else {
                        res.status(500).json({message: 'Sorry, but you should sign in with Google'})
                    }
                } else {
                    res.status(500).json({message: 'The email is unregistered'})
                }
            })
        }
    },

    register: function (req, res) {
        if (/\S+@\S+\.\S+/.test(req.body.email) === false) {
            res.status(500).json({message: 'Please input a valid email address'})
        } else {
            var hashedPassword = bcrypt.hashSync(req.body.password);
            if (req.body.name && req.body.email && req.body.password) {
                User.findOne({
                        email: req.body.email
                    })
                    .then (data => {
                        if (data) {
                            res.status(500).json({message: 'Email has been registered before'})
                        } else {
                            if (req.body.password.length >= 6) {
                                User.create({
                                    name: req.body.name,
                                    email: req.body.email,
                                    password: hashedPassword
                                })
                                .then(data => {
                                    res.status(201).json({message: 'Email registration successful. Please sign in to continue.'})
                                })
                                .catch(err => {
                                    res.status(500).json({message: 'An error occured during the registration process. Please try again later.'})
                                })
                            } else {
                                res.status(500).json({message: 'Password should contain at least 6 characters'})
                            }
                        }
                    })
                    .catch (err => {
                        res.status(500).json({message: 'An error occured during the registration process. Please try again later.'})
                    })
            } else {
                res.status(500).json({message: 'You should input your name, email, and a password to register'})
            }
        }
    },

    getCart: function (req, res) {
        User.findById(req.userId)
        .then(data => {
            res.status(200).json({cart: data.cart})
        })
        .catch(err => {
            res.status(200).json({message: err})
        })
    },

    updateCart: function (req, res) {
        User.updateOne({
            _id: req.userId
        }, {
            cart: req.body.cart
        })
        .then(() => {
            res.status(200).json({})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    checkout: function (req, res) {
        User.findById(req.userId)
        .then(data => {
            let transaction = data.transaction
            transaction.push(data.cart)
            User.updateOne({
                _id: req.userId
            }, {
                transaction: transaction
            })
            .then(() => {
                res.status(200).json({})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    }
}