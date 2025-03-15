"use client";

import { dataUrl, debounce, download, getImageSize } from "@/lib/utils";
import { CldImage, getCldImageUrl } from "next-cloudinary";

import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";

export default function TransformedImage({
	image,
	type,
	title,
	isTransforming,
	setIsTransforming,
	transformationConfig,
	hasDownload = false,
}: TransformedImageProps) {
	function onDownloadHandler(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) {
		e.preventDefault();

		download(
			getCldImageUrl({
				width: image?.width,
				height: image?.height,
				src: image?.publicId,
				...transformationConfig,
			}),
			image?.title
		);
	}
	return (
		<div className="flex flex-col gap-4">
			<div className="flex-between">
				<h3 className="h3-bold text-dark-600">Transformed</h3>
				{hasDownload && (
					<button className="download-btn" onClick={onDownloadHandler}>
						<Image
							src="/assets/icons/download.svg"
							alt="download"
							width={24}
							height={24}
						/>
					</button>
				)}
			</div>
			{image?.publicId && transformationConfig ? (
				<div className="relative">
					<CldImage
						src={image?.publicId}
						alt={image?.title}
						width={getImageSize(type, image, "width")}
						height={getImageSize(type, image, "height")}
						sizes="(max-width: 768px) 100vw, 50vw"
						placeholder={dataUrl as PlaceholderValue}
						className="transformed-image"
						onLoad={() => {
							setIsTransforming?.(false);
						}}
						onError={() => {
							debounce(() => {
								setIsTransforming?.(false);
							}, 8000);
						}}
						{...transformationConfig}
					/>
					{isTransforming && (
						<div className="transforming-loader">
							<Image
								src={"/assets/icons/spinner.svg"}
								alt="loader"
								width={50}
								height={50}
							/>
						</div>
					)}
				</div>
			) : (
				<div className="transformed-placeholder">
					Transformed image will appear here
				</div>
			)}
		</div>
	);
}
