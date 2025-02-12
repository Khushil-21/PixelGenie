import { UserButton } from '@clerk/nextjs'
import React from 'react'

export default function Home() {
	return (
		<div className="flex flex-col gap-5">
			Home
			<UserButton />
		</div>
	);
}
