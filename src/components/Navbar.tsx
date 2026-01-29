"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Server, Database, LayoutDashboard, BookOpen } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (status === "loading") {
        return null;
    }

    if (!session) {
        return null;
    }

    const navLinks = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/cosmos", label: "Cosmos DB", icon: Database },
        { href: "/instructions", label: "Instructions", icon: BookOpen },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <nav className="bg-[#002147] shadow-lg sticky top-0 z-40">
            {/* Top bar */}
            <div className="border-b border-[rgba(255,255,255,0.1)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                                <Server className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:block border-l border-[rgba(255,255,255,0.2)] pl-4">
                                <span className="text-white font-semibold text-lg">Azure Service Bus Manager</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            relative px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all border
                                            ${active 
                                                ? "text-[#002147] bg-white border-white shadow-sm" 
                                                : "text-white! bg-white/20 border-white/40 hover:bg-[#e30613] hover:border-[#e30613]"
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? "text-[#e30613]" : "text-current"}`} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#e30613] flex items-center justify-center text-white font-semibold text-sm">
                                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className="text-gray-200 text-sm font-medium">{session.user?.name}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors text-sm"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-300 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#001530] border-t border-[rgba(255,255,255,0.1)] animate-slideIn">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all
                                        ${active 
                                            ? "text-white bg-[rgba(255,255,255,0.1)] border-l-4 border-[#e30613]" 
                                            : "text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? "text-[#e30613]" : ""}`} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
