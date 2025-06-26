import type {
  User as PrismaUser,
  Todo as PrismaTodo,
  Category as PrismaCategory,
  Tag as PrismaTag,
  TodoTag as PrismaTodoTag,
  PasswordResetToken as PrismaPasswordResetToken
} from "@prisma/client";

// Basis-Typen
export type User = PrismaUser;
export type Todo = PrismaTodo;
export type Category = PrismaCategory;
export type Tag = PrismaTag;
export type TodoTag = PrismaTodoTag;
export type PasswordResetToken = PrismaPasswordResetToken;

// Hilfstypen für verschachtelte Rückgaben

export type TodoWithCategoryAndTags = Todo & {
  category: Category;
  tags: (TodoTag & { tag: Tag })[];
};

export type TodoResponse = Todo & {
  category: Category;
  tags: Tag[];
};
