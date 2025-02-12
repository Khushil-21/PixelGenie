import React from 'react'

export default async function AddTransformationPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    return (
        <div>Add Transformation Page {type}</div>
    )
}
