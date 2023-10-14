import nodemailer from 'nodemailer'
import { accountStatusType } from '../ulti/types';
import UserModel from '../model/user';
import { dataReturn, errorReturn, getErrorMessage } from '../ulti/hook';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { AppError } from '../ulti/appError';
import mongoose from 'mongoose';

const transporter = (user:string,pass:string)=>nodemailer.createTransport({
    service: "gmail",
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: user,
        pass: pass,
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
export const sendEmail = async (otp: string,emailTo:string) => {
    console.log("🚀 ~ file: auth.ts:35 ~ sendEmail ~ email:", emailTo)
    console.log(process.env.EMAIL_USER , process.env.EMAIL_PASS);
    
    try {
        // send mail with defined transport object
        const info = await transporter(process.env.EMAIL_USER,process.env.EMAIL_PASS).sendMail({
            from: `"shop watch" ${process.env.EMAIL_USER}`, // sender address
            to: emailTo, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Mã otp của bạn là ${otp} . OTP sẽ hết hạn sau 1 phút`, // plain text body
            // html: "<b>Hello world?</b>", // html body
        });
        console.log(info);
        

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //
        console.log(info.messageId);
         
    } catch (error) {
        console.log(error);
         
    }

}


export const inputOtp: RequestHandler = async (req,res) => {
    try {
        const {otp,username, password} =req.body
        const check = await UserModel.findOne({ 'username': username, 'password': password })
        if (check && check.otp === otp) {
            await UserModel.findByIdAndUpdate(check._id, { status: "active", otp: null })
            res.send('Kích hoạt tài khoản thành công');
        } else {
            res.send('OTP không chính xác');
        }

    } catch (error) {
        res.send(error);

    }
}

export const login: RequestHandler = async (req, res) => {
// export const login = async () => {
    try {
        const { username, password } = req.body
        const check = await checkActiveUser(username,password)
        if (check.status) {
            const token = generateAccessToken(check.data.userId)
           res.send(dataReturn(token,check.message));
        } else {
           res.send(errorReturn(check.message))
        }
    } catch (error) {
       res.send(errorReturn(getErrorMessage(error)))
    }
}

const checkActiveUser = async (username:string, password:string) => {
    try {
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

export const register: RequestHandler = async (req, res) => {
    try {
        const data = req.body 
        console.log("🚀 ~ file: auth.ts:118 ~ //register ~ data:", data)
        const check = await UserModel.findOne({ 'username': data.username })
        if (check) {
            res.send(errorReturn('Đã tồn tại tài khoản'));
        } else {
            const otp = generateOTP()
            await sendEmail(otp,data.email)
            await UserModel.create({...data,otp:otp})
            res.send(dataReturn({ username: data.username }, 'Đăng ký thành công'));
        }
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)));
    }
}

export const isLoggedIn: RequestHandler = async (req, res, next) => {
    try {
        const token = req.headers.authorization.startsWith('Bearer')
        const decoded = await promisify(jwt.verify).bind(token, process.env.JWT_SECRET)
        const currentUser = await UserModel.findById(decoded.id)
        if (currentUser) {
            return next()
        }
    } catch (error) {
        res.send(error);

    }
}

export const protect: RequestHandler = async (req,res,next) => {
    try {
        let token:string
        console.log(req.headers);
        console.log( req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer'));
        console.log(req.cookies?.jwt);
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            console.log('1');
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            console.log('2');
            token = req.cookies.jwt;
        }else{
            console.log(3);
        console.log('token',token);
            
        }
        console.log('token',token);
        
        if (!token) {
            res.send(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {id:string}
        const currentUser = await UserModel.findById(decoded.id);
        if (!currentUser) {
            res.send(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }
        res.locals.user = currentUser;
        next();
    } catch (error) {
        res.send(error);
    }
}

export const restrictTo = (...roles: string[]): RequestHandler => {

    return (_req, res, next) => {
console.log('restris');

        if (!roles.includes(res.locals.user.role)) {
            res.send(
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