import React from 'react'

export default async function TransformationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>
    Transformations Page {id}
  </div>;
}
