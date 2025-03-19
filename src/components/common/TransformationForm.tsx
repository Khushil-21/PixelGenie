/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useTransition } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	aspectRatioOptions,
	creditFee,
	transformationTypes,
} from "@/constants";
import { CustomField } from "./CustomField";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { updateCredits } from "@/lib/Database/actions/user.action";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/Database/actions/image.action";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import { GlobeIcon, LockIcon } from "lucide-react";

export const formSchema = z.object({
	title: z.string(),
	aspectRatio: z.string().optional(),
	color: z.string().optional(),
	prompt: z.string().optional(),
	publicId: z.string(),
	isPublic: z.boolean().default(true),
});

export default function TransformationForm({
	data = null,
	action,
	type,
	userId,
	creditBalance,
	config = null,
}: TransformationFormProps) {
	const transformationType = transformationTypes[type];
	const [image, setImage] = useState(data);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTransforming, setIsTransforming] = useState(false);
	const [newTransformation, setNewTransformation] =
		useState<Transformations | null>(null);
	const [transformationConfig, setTransformationConfig] = useState(config);
	const [, startTransition] = useTransition();
	const router = useRouter();

	const initialValues =
		data && action === "Update"
			? {
					title: data?.title,
					aspectRatio: data?.aspectRatio,
					color: data?.color,
					prompt: data?.prompt,
					publicId: data?.publicId,
					isPublic: data?.isPublic ?? true,
			  }
			: {
					title: "",
					aspectRatio: "",
					color: "",
					prompt: "",
					publicId: "",
					isPublic: true,
			  };

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: initialValues,
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);

		if (data || image) {
			const transformationUrl = getCldImageUrl({
				width: image?.width,
				height: image?.height,
				src: image?.publicId,
				...transformationConfig,
			});

			const imageData = {
				title: values.title,
				publicId: image?.publicId,
				transformationType: type,
				width: image?.width,
				height: image?.height,
				config: transformationConfig,
				secureURL: image?.secureURL,
				transformationURL: transformationUrl,
				aspectRatio: values.aspectRatio,
				prompt: values.prompt,
				color: values.color,
				isPublic: values.isPublic,
			};

			if (action === "Add") {
				try {
					const newImage = await addImage({
						image: imageData,
						userId,
						path: "/",
					});

					if (newImage) {
						form.reset();
						setImage(data);
						router.push(`/transformations/${newImage._id}`);
					}
				} catch (error) {
					console.log(error);
				}
			}

			if (action === "Update") {
				try {
					const updatedImage = await updateImage({
						image: {
							...imageData,
							_id: data._id,
						},
						userId,
						path: `/transformations/${data._id}`,
					});

					if (updatedImage) {
						router.push(`/transformations/${updatedImage._id}`);
					}
				} catch (error) {
					console.log(error);
				}
			}
		}

		setIsSubmitting(false);
	}

	function onSelectFieldHandler(
		value: string,
		onChange: (value: string) => void
	) {
		const imageSize = aspectRatioOptions[value as AspectRatioKey];

		setImage((prevState: any) => ({
			...prevState,
			aspectRatio: imageSize.aspectRatio,
			width: imageSize.width,
			height: imageSize.height,
		}));

		setNewTransformation(transformationType.config);

		return onChange(value);
	}

	function onInputChangeHandler(
		fieldName: string,
		value: string,
		type: string,
		onChange: (value: string) => void
	) {
		debounce(() => {
			setNewTransformation((prevState: any) => ({
				...prevState,
				[type]: {
					...prevState?.[type],
					[fieldName === "prompt" ? "prompt" : "to"]: value,
				},
			}));
		}, 1000)();

		return onChange(value);
	}

	async function onTransformHandler() {
		setIsTransforming(true);

		setTransformationConfig(
			deepMergeObjects(transformationConfig, newTransformation)
		);

		setNewTransformation(null);

		startTransition(async () => {
			// TODO: Implement the transformation logic
			await updateCredits(userId, creditFee, "subtraction");
		});
	}

	useEffect(() => {
		if (image && (type === "restore" || type === "removeBackground")) {
			setNewTransformation(transformationType.config);
		}
	}, [image, transformationType.config, type]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
				<CustomField
					control={form.control}
					name="title"
					formLabel="Image Title"
					className="w-full"
					render={({ field }) => <Input {...field} className="input-field" />}
				/>

				<div className="mt-6 mb-4">
					{/* <h3 className="p-16-medium text-dark-600 mb-2">Image Visibility</h3> */}
					<CustomField
						formLabel="Image Visibility"
						control={form.control}
						name="isPublic"
						className="w-full"
						render={({ field }) => (
							<div className="flex gap-3">
								{[
									{ label: "Public", value: true, icon: GlobeIcon },
									{ label: "Private", value: false, icon: LockIcon }
								].map((option) => (
									<div
										key={option.label}
										className={`rounded-full w-1/2 py-2 px-3 ring-1 cursor-pointer flex justify-center items-center gap-2 transition-all ${
											field.value === option.value
												? "bg-purple-gradient text-white font-semibold ring-purple-500"
												: "bg-white text-gray-700 ring-gray-200 hover:ring-purple-300"
										}`}
										onClick={() => field.onChange(option.value)}
									>
										<option.icon 
											className="w-4 h-4" 
										/>
										{option.label}
									</div>
								))}
							</div>
						)}
					/>
				</div>

				{type === "fill" && (
					<CustomField
						control={form.control}
						name="aspectRatio"
						formLabel="Aspect Ratio"
						className="w-full"
						render={({ field }) => (
							<Select
								onValueChange={(value) =>
									onSelectFieldHandler(value, field.onChange)
								}
							>
								<SelectTrigger className="select-field">
									<SelectValue placeholder="Select Size" />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(aspectRatioOptions).map((key) => (
										<SelectItem key={key} value={key}>
											{aspectRatioOptions[key as AspectRatioKey].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				)}

				{(type === "remove" || type === "recolor") && (
					<div className="prompt-field">
						<CustomField
							control={form.control}
							name="prompt"
							formLabel={`Object to ${type}`}
							className="w-full"
							render={({ field }) => (
								<Input
									value={field.value}
									className="input-field"
									onChange={(e) =>
										onInputChangeHandler(
											"prompt",
											e.target.value,
											type,
											field.onChange
										)
									}
								/>
							)}
						/>

						{type === "recolor" && (
							<CustomField
								control={form.control}
								name="color"
								formLabel="Replacement Color"
								className="w-full"
								render={({ field }) => (
									<Input
										value={field.value}
										className="input-field"
										onChange={(e) =>
											onInputChangeHandler(
												"color",
												e.target.value,
												"recolor",
												field.onChange
											)
										}
									/>
								)}
							/>
						)}
					</div>
				)}

				<div className="media-uploader-field">
					<CustomField
						control={form.control}
						name="publicId"
						className="flex size-full flex-col"
						render={({ field }) => (
							<MediaUploader
								onValueChange={field.onChange}
								setImage={setImage}
								image={image}
								publicId={field.value}
								type={type}
							/>
						)}
					/>

					<TransformedImage
						image={image}
						type={type}
						title={form.getValues().title}
						isTransforming={isTransforming}
						setIsTransforming={setIsTransforming}
						transformationConfig={transformationConfig}
					/>
				</div>

				<div className="flex flex-col gap-4">
					<Button
						type="button"
						className="submit-button capitalize"
						disabled={isTransforming || newTransformation === null}
						onClick={onTransformHandler}
					>
						{isTransforming ? "Transforming..." : "Apply Transformation"}
					</Button>
					<Button
						type="submit"
						className="submit-button capitalize"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Submitting..." : "Save Image"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
