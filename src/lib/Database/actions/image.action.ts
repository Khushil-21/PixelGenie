/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'
import User from "../models/User.model";
import { connectToDatabase } from "../databaseConnection";
import Image from "../models/Image.model";
import { handleError } from "@/lib/utils";

const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    })

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error)
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    )

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error)
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error)
  } finally {
    redirect('/')
  }
}

// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error)
  }
}

// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=PixelGenie';

    if (searchQuery) {
      expression += ` AND ${searchQuery}`
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();


    const resourceIds = resources.map((resource: any) => resource.public_id);


    let query = {
      isPublic: true
    };
    
    if (searchQuery) {
      query = {
        isPublic: true,
      } as any;
      
      (query as any).$or = [
        { publicId: { $in: resourceIds } },
        { title: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    console.log("query: ", query);

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);



    const totalImages = await Image.find(query).countDocuments();


    const savedImages = await Image.find().countDocuments();


    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    }
  } catch (error) {
    handleError(error)
  }
}

// GET USER IMAGES
export async function getUserImages({ limit = 9, page = 1, userId }: {
  limit?: number;
  page: number;
  userId: string;
  visibility?: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET USER IMAGES WITH FILTER
export async function getUserImagesWithFilter({ limit = 9, page = 1, userId, visibility = 'all' }: {
  limit?: number;
  page: number;
  userId: string;
  visibility?: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    
    let query = { author: userId };
    
    if (visibility === 'public') {
      query = { author: userId, isPublic: true } as any;
    } else if (visibility === 'private') {
      query = { author: userId, isPublic: false } as any;
    }

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// TOGGLE IMAGE VISIBILITY
export async function toggleImageVisibility(imageId: string, userId: string) {
  try {
    await connectToDatabase();

    const image = await Image.findById(imageId);
    
    if (!image || image.author.toString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }
    
    // Toggle the isPublic status
    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      { isPublic: !image.isPublic },
      { new: true }
    );
    
    revalidatePath('/');
    revalidatePath(`/transformations/${imageId}`);
    revalidatePath('/profile');
    
    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}