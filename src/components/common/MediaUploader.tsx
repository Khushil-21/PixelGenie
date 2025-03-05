"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "sonner";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

interface MediaUploaderProps {
	onValueChange: (value: string) => void;
	setImage: React.Dispatch<any>;
	image: any;
	publicId: string;
	type: string;
}

export default function MediaUploader({
	onValueChange,
	setImage,
	image,
	publicId,
	type,
}: MediaUploaderProps) {
	function onUploadSuccessHandler(result: any) {
		setImage((prevState: any) => ({
			...prevState,
			publicId: result?.info?.public_id,
			width: result?.info?.width,
			height: result?.info?.height,
			secureUrl: result?.info?.secure_url,
		}));
		onValueChange(result?.info?.public_id);
		toast.success("Image Uploaded Successfully !!", {
			description: "1 Credit was deducted from your account",
			duration: 5000,
			className: "success-toast",
			position: "top-center",
		});
	}
	function onUploadErrorHandler(error: any) {
		console.log(error);
		toast.error("Something went wrong while uploading an image !!", {
			description: "Try again",
			duration: 5000,
			className: "error-toast",
			position: "top-center",
		});
	}
	return (
		<CldUploadWidget
			uploadPreset="PixelGenie"
			options={{
				multiple: false,
				resourceType: "image",
			}}
			onSuccess={onUploadSuccessHandler}
			onError={onUploadErrorHandler}
		>
			{({ open }) => {
				return (
					<div className="flex flex-col gap-4">
						<h3 className="h3-bold text-dark-600">Original</h3>
						{publicId ? (
							<>
								<div className="cursor-pointer overflow-hidden rounded-[10px]">
									<CldImage
										src={publicId}
										alt="Uploaded Image"
										width={getImageSize(type, image, "width")}
										height={getImageSize(type, image, "height")}
										sizes="(max-width: 768px) 100vw, 50vw"
                                        placeholder={dataUrl as PlaceholderValue}
                                        className="media-uploader_cldImage"
									/>
								</div>
							</>
						) : (
							<div className="media-uploader_cta " onClick={() => open()}>
								<div className="media-uploader_cta-image">
									<Image
										src={"/assets/icons/add.svg"}
										alt="Uploaded Image"
										width={24}
										height={24}
									/>
								</div>
								<p className="p-14-medium">Upload an Image</p>
							</div>
						)}
					</div>
				);
			}}
		</CldUploadWidget>
	);
}
