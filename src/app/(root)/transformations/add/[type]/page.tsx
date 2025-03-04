import Header from '@/components/common/Header';
import TransformationForm from '@/components/common/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/Database/actions/user.action';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function AddTransformationPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const user = await getUserById(userId);

    const { title, subTitle } = transformationTypes[type as keyof typeof transformationTypes];
    return (
        <>
            <Header
                title={title}
                subtitle={subTitle}
            />
            <TransformationForm
                action='Add'
                userId={user?._id}
                type={type as TransformationTypeKey}
                creditBalance={user?.creditBalance}
            />
        </>
    )
}
