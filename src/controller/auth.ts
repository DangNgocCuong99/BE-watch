import nodemailer from 'nodemailer'
import { accountStatusType } from '../ulti/types';
import UserModel from '../model/user';
import { dataReturn, errorReturn, getErrorMessage } from '../ulti/hook';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { AppError } from '../ulti/appError';
import mongoose from 'mongoose';


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async (otp: string) => {
    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: "dangngoccuong99@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Mã otp của bạn là ${otp} . OTP sẽ hết hạn sau 1 phút`, // plain text body
            // html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //
        return info.messageId;
    } catch (error) {
        return error
    }

}


export const inputOtp = async () => {
    try {
        const otp = '1234'
        const { username, password } = { username: 'admin', password: 'admin' }
        const check = await UserModel.findOne({ 'username': username, 'password': password })
        if (check && check.otp === otp) {
            await UserModel.findByIdAndUpdate(check._id, { status: "active", otp: null })
            console.log('OTP thành công');
        } else {
            console.log('OTP không chính xác');
        }

    } catch (error) {
        console.log(error);

    }
}

// export const login: RequestHandler = async (req, res) => {
export const login = async () => {
    try {
        const check = await checkActiveUser()
        console.log("🚀 ~ file: user.ts:69 ~ login ~ check:", check)
        if (check.status) {
            const token = generateAccessToken(check.data.userId)
            console.log(check.message, token);
        } else {
            console.log(check.message)
        }
    } catch (error) {
        console.log(errorReturn(getErrorMessage(error)))
    }
}

const checkActiveUser = async () => {
    try {
        const { username, password } = { username: 'admin', password: 'admin' }
        const check = await UserModel.findOne({ 'username': username, 'password': password })
        if (check) {
            if (check.status === accountStatusType.inactive) {
                return { status: false, message: "Vui lòng kích hoạt tài khoản" }
            } else {
                return { status: true, message: 'Đăng nhập thành công', data: { userId: check._id } }
            }
        } else {
            return { status: false, message: 'Tài khoản hoặc mật chưa chính xác' }
        }
    } catch (error) {
        console.log(errorReturn(error));
    }
}

// export const register: RequestHandler = async (req, res) => {
export const register = async () => {
    try {
        const data = { username: 'admin', password: 'admin', email: 'admin@gmail.com' }
        const check = await UserModel.findOne({ 'username': data.username })
        if (check) {
            console.log(errorReturn('Đã tồn tại tài khoản'));
        } else {
            const otp = generateOTP()
            await sendEmail(otp)
            await UserModel.create(data)
            console.log(dataReturn({ username: data.username }, 'Đăng ký thành công'));
        }
    } catch (error) {
        console.log(errorReturn(getErrorMessage(error)));
    }
}

export const isLoggedIn: RequestHandler = async (req, _, next) => {
    try {
        const token = req.headers.authorization.startsWith('Bearer')
        const decoded = await promisify(jwt.verify).bind(token, process.env.JWT_SECRET)
        const currentUser = await UserModel.findById(decoded.id)
        if (currentUser) {
            return next()
        }
    } catch (error) {
        console.log(error);

    }
}

export const protect: RequestHandler = async (req,res,next) => {
    try {
        let token:string
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {id:string}
        const currentUser = await UserModel.findById(decoded.id);
        if (!currentUser) {
            return next(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }
        res.locals.user = currentUser;
        next();
    } catch (error) {
        console.log(error);
    }
}

export const restrictTo = (...roles: string[]): RequestHandler => {
    return (_req, res, next) => {
        if (!roles.includes(res.locals.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

export const generateAccessToken = (userId: mongoose.Types.ObjectId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN_ACCES_KEY
    });
};