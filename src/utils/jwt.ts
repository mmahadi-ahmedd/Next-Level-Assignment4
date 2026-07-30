import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions) => {
    const token = jwt.sign(
        payload,
        secret,
        {
            expiresIn
        } as SignOptions
    );

    return token;
}

const verifyToken = (token: string, secret: string) => {
    console.log("secret value:", process.env.JWT_ACCESS_SECRET);
    console.log("secret param:", secret ? "HAS VALUE" : "UNDEFINED/EMPTY");
    try {
        const verifiedToken = jwt.verify(token, secret);
        return {
            success: true,
            data: verifiedToken
        };
    } catch (error: any) {
        console.log("Token verification failed:", error);
        return {
            success: false,
            error: error.message
        }
    }
}


export const jwtUtils = {
    createToken,
    verifyToken
}