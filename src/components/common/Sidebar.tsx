"use client"
import { navLinks } from '@/constants'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'

export default function Sidebar() {
    const pathname = usePathname()
    return (
        <aside className='sidebar'>
            <div className='flex flex-col size-full gap-4'>
                <Link href='/' className='flex items-center gap-2'>
                    <Image src='/assets/images/logo-text.svg' alt='logo' width={180} height={28} />
                </Link>
                <nav className='sidebar-nav'>
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {
                                navLinks.slice(0, 6).map((link) => {
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
                        <ul className='sidebar-nav_elements'>
                            {
                                navLinks.slice(6).map((link) => {
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
                            <li className='flex-center cursor-pointer gap-2 p-4'>
                                <UserButton showName appearance={{
                                    variables: {
                                        colorPrimary: "#624cf5",
                                    },
                                }} />
                            </li>
                        </ul>
                    </SignedIn>
                    <SignedOut>
                        <Button asChild className='button bg-purple-gradient bg-cover'>
                            <Link href='/sign-in'>Login</Link>
                        </Button>
                    </SignedOut>
                </nav>
            </div>
        </aside>
    )
}
