import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card as ShadCard, CardContent, CardFooter } from '@/components/ui/card'; // Use Shadcn Card
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  front_content: string;
  back_content: string;
}

interface CardDisplayProps {
  card: Card;
  onRate?: (rating: number) => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onRate }) => {
  const [showBack, setShowBack] = useState(false);

  const handleShowBack = () => {
    setShowBack(true);
  };

  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(rating);
    }
    setShowBack(false); // Reset for next card
  };

  return (
    <ShadCard className="w-full max-w-2xl mx-auto min-h-[350px] flex flex-col justify-between p-6 bg-card border-border shadow-lg">
      {/* Front Content */}
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center text-xl md:text-2xl whitespace-pre-wrap break-words">
          {card.front_content}
        </div>
      </CardContent>

      {/* Separator and Back Content (Conditional) */}
      {showBack && (
        <>
          <hr className="my-4 border-border" />
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-xl md:text-2xl whitespace-pre-wrap break-words text-muted-foreground">
              {card.back_content}
            </div>
          </CardContent>
        </>
      )}

      {/* Footer with Buttons */}
      <CardFooter className="mt-auto pt-6">
        {showBack ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Rating buttons mapped to SM-2 quality scores (q) */}
            <Button variant="destructive" onClick={() => handleRate(0)} className="w-full">Errei (0)</Button>
            <Button variant="outline" onClick={() => handleRate(3)} className="w-full">Difícil (3)</Button>
            <Button variant="secondary" onClick={() => handleRate(4)} className="w-full">Bom (4)</Button>
            <Button variant="default" onClick={() => handleRate(5)} className="w-full">Fácil (5)</Button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Button onClick={handleShowBack} size="lg">Mostrar Verso</Button>
          </div>
        )}
      </CardFooter>
    </ShadCard>
  );
};

export default CardDisplay;

