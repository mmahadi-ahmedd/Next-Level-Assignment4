import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) {
    throw new ApiError(409, 'A category with this name already exists.');
  }
  return prisma.category.create({ data: payload });
};

export const CategoryService = {
  getAllCategories,
  createCategory,
};
