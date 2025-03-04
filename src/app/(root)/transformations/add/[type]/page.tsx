import Header from '@/components/common/Header';
import { transformationTypes } from '@/constants';
import React from 'react'

export default async function AddTransformationPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const { title, subTitle } = transformationTypes[type as keyof typeof transformationTypes];
    console.log("type: ", type);
    return (
        <div>
            <Header
                title={title}
                subtitle={subTitle}
            />
        </div>
    )
}
