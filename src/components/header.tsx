'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, Menu } from 'lucide-react'; // Removed Leaf import
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { href: '/#inicio', label: 'Início' },
  { href: '/#sobre', label: 'Sobre mim' },
  { href: '/#agenda', label: 'Agenda' },
  { href: '/#fale-conosco', label: 'Fale Conosco' },
];

export function SiteHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);


  const handleLogout = () => {
    if (!auth) return;
    signOut(auth).then(() => {
      router.push('/');
    });
  };
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      if (pathname === '/') {
        e.preventDefault();
        const targetId = href.replace(/.*\#/, '');
        const elem = document.getElementById(targetId);
        elem?.scrollIntoView({ behavior: 'smooth' });
      }
      // If not on homepage, let default Link behavior handle navigation and anchor jump.
    }
  };


  const showAuthButtons = !isUserLoading && !user && pathname !== '/login' && pathname !== '/signup';

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full text-primary-foreground transition-colors duration-300",
      scrolled ? "bg-primary/80 backdrop-blur-sm" : "bg-primary"
    )}>
      <div className="container flex h-20 items-center">
        {/* Removed Link with Leaf icon and 'Livi Skov' text */}
        
        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-lg font-bold text-white transition-colors hover:text-white/70">
                {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center">
            {/* Desktop Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-2">
                {!isUserLoading && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-foreground/10">
                          <UserCircle className="h-5 w-5 text-white" />
                          <span className="sr-only">Toggle user menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/courses')}>Área de Membros</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : showAuthButtons ? (
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                        <Link href="/signup">Cadastre-se</Link>
                      </Button>
                      <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                        <Link href="/login">Login</Link>
                      </Button>
                    </div>
                ) : null}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                            <Menu className="h-6 w-6"/>
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-primary text-primary-foreground border-l-0 w-[300px] p-0">
                        <div className="flex h-full flex-col">
                            <div className="p-6">
                                <SheetClose asChild>
                                <Link href="/" className="flex items-center gap-2 text-primary-foreground">
                                    {/* Removed Leaf icon and 'Livi Skov' text */}
                                    <span className="text-xl font-bold">Menu</span> {/* Added a simple 'Menu' title for mobile */}
                                </Link>
                                </SheetClose>
                            </div>
                             <Separator className="bg-primary-foreground/20" />
                            <nav className="flex flex-col gap-4 p-6 text-lg">
                                {navLinks.map((link) => (
                                    <SheetClose asChild key={link.href}>
                                        <Link href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="font-medium text-white transition-colors hover:text-white/70">
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-auto border-t border-primary-foreground/20 p-6">
                                <div className="flex flex-col gap-4">
                                    {!isUserLoading && user ? (
                                        <>
                                            <SheetClose asChild>
                                                <Button variant="ghost" onClick={() => router.push('/courses')} className="w-full justify-start gap-2 text-lg">
                                                    <UserCircle className="h-5 w-5" />
                                                    <span>Área de Membros</span>
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-lg">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    <span>Sair</span>
                                                </Button>
                                            </SheetClose>
                                        </>
                                    ) : showAuthButtons ? (
                                        <>
                                            <SheetClose asChild>
                                                <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 w-full text-lg h-12">
                                                    <Link href="/login">Login</Link>
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button asChild variant="outline" className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground w-full text-lg h-12">
                                                    <Link href="/signup">Cadastre-se</Link>
                                                </Button>
                                            </SheetClose>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}