import Link from 'next/link';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { Button } from './ui/button';

export function SocialSidebar() {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      <Link href="http://instagram.com/liviskov" target="_blank" rel="noopener noreferrer">
        <Button variant="default" size="icon" className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200">
          <Instagram className="h-6 w-6 text-primary-foreground" />
          <span className="sr-only">Instagram</span>
        </Button>
      </Link>
      <Link href="https://www.facebook.com/livi.skov/" target="_blank" rel="noopener noreferrer">
        <Button variant="default" size="icon" className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200">
          <Facebook className="h-6 w-6 text-primary-foreground" />
          <span className="sr-only">Facebook</span>
        </Button>
      </Link>
      <Link href="https://www.youtube.com/@LiviSkov" target="_blank" rel="noopener noreferrer">
        <Button variant="default" size="icon" className="rounded-full shadow-lg hover:scale-110 transition-transform duration-200">
          <Youtube className="h-6 w-6 text-primary-foreground" />
          <span className="sr-only">YouTube</span>
        </Button>
      </Link>
    </div>
  );
}
