import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItem as MenuItemType } from '@/types';
import { formatPrice } from '@/lib/utils';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-muted">
        {item.image_url || item.image ? (
          <Image
            src={item.image_url ?? item.image!}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.category && (
              <p className="text-xs text-muted-foreground">{item.category.name}</p>
            )}
          </div>
          <div className="ml-4 text-right">
            <p className="text-lg font-bold text-primary">{formatPrice(item.price)}</p>
          </div>
        </div>
      </CardHeader>

      {item.description && (
        <CardContent>
          <CardDescription>{item.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}
