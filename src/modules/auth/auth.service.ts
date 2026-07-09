import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';
import { JwtPayload, SignOptions } from 'jsonwebtoken';



interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'CUSTOMER' | 'TECHNICIAN';
}

interface LoginInput {
  email: string;
  password: string;
}

const register = async (payload: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
    },
  });

  if (payload.role === 'TECHNICIAN') {
    await prisma.technicianProfile.create({
      data: {
        userId: user.id,
        hourlyRate: 0,
        location: 'Not set',
      },
    });
  }

//   const token = signToken({ userId: user.id, role: user.role, email: user.email });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword};
// return user
};

const login = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email');
  }

  if (user.status === 'BANNED') {
    throw new ApiError(403, 'Your account has been banned. Contact support.');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password.');
  }

  // const token = signToken({ userId: user.id, role: user.role, email: user.email });

   const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };

  // const { password, ...userWithoutPassword } = user;

  // return { user: userWithoutPassword, token };
  // return user
};


const getMe = async (userId : number) => {
    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit : {
            password : true
        },
        include : {
            technicianProfile : true
        }
    });

    return user;
}

const refreshToken = async (refreshToken : string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

    if(!verifiedRefreshToken.success){
        throw new Error(verifiedRefreshToken.error)
    }

    const {id} = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id
        }
    })

    if(user.status === "BANNED"){
        throw new Error("User is banned!")
    }

    const jwtPayload = {
        id,
        name : user.name,
        email : user.email,
        role : user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return {accessToken}
}

export const AuthService = {
  register,
  login,
  getMe,
  refreshToken
};
