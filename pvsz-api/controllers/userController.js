const { User, PlantGroup,CustomPlant } = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtKey = "RANDOM-TOKEN";

exports.register = async (req, res, next) => {

    let user = await User.findOne({
        email: req.body.email,
    });
    if (user) {
        res.status(500).send({
            message: "The mailbox already exists",
        });
        return;
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            image: req.body.image,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            dateOfBirth: req.body.birthdayDate,
            email: req.body.email,
            password: hashedPassword,
        });
        const result = await user.save();
        res.status(201).send({
            message: "User has been Created Successfully",
            result,
        });
    } catch (e) {
        console.log(e, "fail");
        res.status(200).json({
            code: 1,
            message: "Registration Failed",
        });
    }
};

exports.login = async (req, res, next) => {
    User.findOne({
        email: req.body.email,
    })
        // if email exists
        .then((user) => {
            // compare the password entered and the hashed password found
            bcrypt
                .compare(req.body.password, user.password)

                // if the passwords match
                .then((passwordCheck) => {
                    // check if password matches
                    if (!passwordCheck) {
                        return res.status(400).send({
                            message:
                                "Login failed! Please check your email and password.",
                            error,
                        });
                    }
                    //   create JWT token
                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userName: user.userName,
                        },
                        jwtKey,
                        {
                            expiresIn: "24h",
                        }
                    );

                    //   return success response
                    res.status(200).send({
                        message: "Login Successful",
                        userName: user.userName,
                        token,
                    });
                })
                // catch error if password does not match
                .catch((error) => {
                    res.status(400).send({
                        message:
                            "Login failed! Please check your email and password.",
                        error,
                    });
                });
        })
        // catch error if email does not exist
        .catch((e) => {
            res.status(404).send({
                message: "Login failed! Please check your email and password.",
            });
        });
};

exports.getUserInfo = async (req, res, next) => {
    let token = req.get("Authorization");
    console.log(token)
    if (!token) {
        res.status(401).send({
            message: "Unauthenticated request",
        });
        return;
    }
    token = token.split("Bearer ")[1];
    jwt.verify(token, jwtKey, async (err, decode) => {
        if (err) {
            res.status(401).send({
                message: "Unauthenticated request",
            });
        } else {
            let userId = decode.userId;
            try {
                let userItem = await User.findById(userId).populate(
                    "plantList"
                ).populate({
                    path: 'groups',
                    populate: {
                        path: 'plants'
                    }
                });
                let user = await User.findOne({ _id: userId })
                res.json({
                    code: 200,
                    userName: user.userName,
                    birthday: user.dateOfBirth,
                    data: userItem,
                });
            } catch (error) {
                res.status(500).send("Exceptions in server query");
            }
        }
    });
};


exports.setUserInfo = async (req, res, next) => {
    let token = req.get("Authorization");
    if (!token) {
        res.status(401).send({
            message: "Unauthenticated request",
        });
        return;
    }
    token = token.split("Bearer ")[1];
    jwt.verify(token, jwtKey, (err, decode) => {
        if (err) {
            res.status(401).send({
                message: "Unauthenticated request",
            });
        } else {
            let userId = decode.userId;
            User.findByIdAndUpdate(
                {
                    _id: userId,
                },
                {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    userName: req.body.userName,
                    image: req.body.image,
                },
                (err, doc) => {
                    if (err) {
                        res.status(500).send("Exceptions in server");
                        return;
                    }
                    res.status(201).send({
                        message: "User Information has been Changed Successfully",
                    });
                }
            );
        }
    });
};

exports.changePassword = async (req, res, next) => {
    let token = req.get("Authorization");
    if (!token) {
        res.status(401).send({
            message: "Unauthenticated request",
        });
        return;
    }
    token = token.split("Bearer ")[1];
    jwt.verify(token, jwtKey, async (err, decode) => {
        if (err) {
            res.status(401).send({
                message: "Unauthenticated request",
            });
        } else {
            let userId = decode.userId;
            let user = await User.findById(userId);
            bcrypt.compare(req.body.oldPassword, user.password, async function (err, result) {
                if (err) {
                    res.status(500).send("Exceptions in server");
                    return;
                }
                if (result) {
                    bcrypt.compare(req.body.newPassword, user.password, async function (err1, result) {
                        if (err1) {
                            res.status(500).send("Exceptions in server");
                            return;
                        }
                        if (result) {
                            res.status(400).send({
                                message: "Password is same as previous one",
                                err,
                            });
                        } else {
                            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)
                            User.findByIdAndUpdate(
                                {
                                    _id: userId,
                                },
                                {
                                    password: hashedPassword
                                },
                                (err2, doc) => {
                                    if (err2) {
                                        res.status(500).send("Exceptions in server");
                                        return;
                                    }
                                    res.status(201).send({
                                        message: "Password has been Changed Successfully",
                                    });
                                }
                            );
                        }
                    });
                } else{
                    res.status(400).send({
                        message: "Oldpassword is incorrect!",
                        err,
                    });
                }
            })
        }
    });
};


exports.dels = async (req, res, next) => {
    let token = req.get("Authorization");
    if (!token) {
        res.status(401).send({
            message: "Unauthenticated request",
        });
        return;
    }
    token = token.split("Bearer ")[1];
    jwt.verify(token, jwtKey, async (err, decode) => {
        if (err) {
            res.status(401).send({
                message: "Unauthenticated request",
            });
        } else {
            let userId = decode.userId;
            try {
                let user = await User.findById(userId)
                
                let r1 = await CustomPlant.deleteMany({
                    _id: { $in: user.plantList },
                });
                let r2 = await PlantGroup.deleteMany({
                    _id: { $in: user.groups },
                });
                let r3 = await User.deleteOne({_id:userId})
                res.json({
                    code: 200,
                    message: "Deleted successfully!"
                });
            } catch (error) {
                res.status(500).send("Exceptions in server");
            }
        }
    });
};