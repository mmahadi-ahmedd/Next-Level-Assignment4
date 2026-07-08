import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import { signToken } from '../../utils/jwt';



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

  const hashedPassword = await bcrypt.hash(payload.password, 10);

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

  const token = signToken({ userId: user.id, role: user.role, email: user.email });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};



export const AuthService = {
  register,
};
