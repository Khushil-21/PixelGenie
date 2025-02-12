import React from 'react'

export default async function UpdateTransformationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>Update Transformation Page {id}</div>
    )
}
