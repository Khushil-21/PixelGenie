"use client"
import { navLinks } from '@/constants'
import { SignedIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
    const pathname = usePathname()
    return (
        <aside className='sidebar'>
            <div className='flex flex-col size-full gap-4'>
                <Link href='/' className='flex items-center gap-2'>
                    <Image src='assets/images/logo-text.svg' alt='logo' width={180} height={28} />
                </Link>
                <nav className='sidebar-nav'>
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {
                                navLinks.map((link) => {
                                    const isActive = pathname === link.route

                                    return (
                                        <li key={link.route} className={`sidebar-nav_element ${isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'}`}>

                                            <Link href={link.route} className='sidebar-link'>
                                                <Image src={link.icon} alt={link.label} className={`${isActive && 'brightness-200'}`} width={24} height={24} />
                                                {link.label}
                                            </Link>
                                        </li>
                                    )
                                })}
                        </ul>
                    </SignedIn>
                </nav>
            </div>
        </aside>
    )
}
