/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useTransition } from "react";

import { object, z } from "zod";
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
	defaultValues,
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

export const formSchema = z.object({
	title: z.string(),
	aspectRatio: z.string().optional(),
	color: z.string().optional(),
	prompt: z.string().optional(),
	publicId: z.string(),
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
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const initialValues =
		data && action === "Update"
			? {
					title: data?.title,
					aspectRatio: data?.aspectRatio,
					color: data?.color,
					prompt: data?.prompt,
					publicId: data?.publicId,
			  }
			: defaultValues;

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
			await updateCredits(userId, 1);
		});
	}

	useEffect(() => {
		if(image && (type === "restore" || type === "removeBackground")) {
			setNewTransformation(transformationType.config);
		}
	}, [image,transformationType.config,type]);

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
