import logo from '@/app/icon0.svg';
import Image from 'next/image';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps) {
  return <Image src={logo} alt="Logo" width={size} height={size} />;
}
