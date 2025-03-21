//ujkj
"use server";

import { revalidatePath } from "next/cache";
import User from "@/lib/Database/models/User.model";
import { handleError } from "@/lib/utils";
import { connectToDatabase } from "@/lib/Database/databaseConnection";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();

    const users = await User.find();

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// Get user by MongoDB ID
export async function getUserByMongoId(id: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number, transactionType: "addition" | "subtraction") {
  try {
    await connectToDatabase();
    console.log("userId: ", userId);
    console.log("creditFee: ", creditFee);
    console.log("transactionType: ", transactionType);

    if (transactionType === "subtraction") {
      creditFee = creditFee * -1;
    }
    console.log("creditFee: ", creditFee);

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    )
    console.log("updatedUserCredits: ", updatedUserCredits);

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}