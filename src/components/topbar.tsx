'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { mockUnits, mockUser } from '@/lib/mock-data';
import { Building2, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState(mockUnits[0]);

  const handleUnitChange = (unitId: string) => {
    const unit = mockUnits.find((u) => u.id === unitId);
    if (unit) {
      setSelectedUnit(unit);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        {/* Unit Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Unidade:</span>
          </div>
          <Select value={selectedUnit.id} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-[280px] h-9">
              <SelectValue>
                <span className="font-medium">{selectedUnit.code}</span>
                <span className="text-muted-foreground ml-2 hidden md:inline">
                  - {selectedUnit.name}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {mockUnits
                .filter((u) => u.active)
                .map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <span className="font-medium">{unit.code}</span>
                    <span className="text-muted-foreground ml-2">
                      - {unit.name}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Environment Badge */}
          <Badge
            variant={selectedUnit.ambiente === 'PRODUCAO' ? 'default' : 'secondary'}
            className={
              selectedUnit.ambiente === 'PRODUCAO'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
            }
          >
            {selectedUnit.ambiente === 'PRODUCAO' ? 'Produção' : 'Homologação'}
          </Badge>
        </div>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {mockUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-sm">
              <span className="font-medium">{mockUser.name}</span>
              <span className="text-xs text-muted-foreground">{mockUser.role}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

