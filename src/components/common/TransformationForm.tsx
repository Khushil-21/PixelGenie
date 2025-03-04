"use client";
import React, { useState } from "react";

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

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { aspectRatioOptions, defaultValues } from "@/constants";
import { CustomField } from "./CustomField";
import { AspectRatioKey } from "@/lib/utils";

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
}: TransformationFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTransforming, setIsTransforming] = useState(false);
	const [newTransformation, setNewTransformation] =
		useState<Transformations | null>(null);

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
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}

	function onSelectFieldHandler(
		value: string,
		onChange: (value: string) => void
	) {
		console.log(value);
		onChange(value);
	}

	function onInputChangeHandler(
		fieldName: string,
		value: string,
		type: string,
		onChange: (value: string) => void
	) {
		console.log(fieldName, value, type);
		onChange(value);
	}

	function onTransformHandler() {
		setIsSubmitting(true);
		setIsTransforming(true);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
