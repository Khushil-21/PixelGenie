import MobileNavbar from '@/components/common/MobileNavbar'
import Sidebar from '@/components/common/Sidebar'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="root">
            <Sidebar />
            <MobileNavbar />

            <div className="root-container">
                <div className="wrapper">
                    {children}
                </div>
            </div>
        </div>
    )
}
