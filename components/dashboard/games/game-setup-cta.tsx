"use client";

import { GameController03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";
import { useState } from "react";

import type { CollectionOption } from "./game-meta";
import { GameSetupFlow } from "./setup-flow/game-setup-flow";

/**
 * The dashboard CTA that opens the game configuration stepper. Holds the open
 * state and lazily mounts the flow so the overlay (and its viewport listeners)
 * only exist while in use.
 */
export function GameSetupCta({
  exclusiveCollections,
  gameCollections,
}: {
  exclusiveCollections: CollectionOption[];
  gameCollections: CollectionOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="cursor-pointer" onPress={() => setOpen(true)}>
        <HugeiconsIcon icon={GameController03Icon} className="size-4" />
        Set up a game
      </Button>

      {open ? (
        <GameSetupFlow
          exclusiveCollections={exclusiveCollections}
          gameCollections={gameCollections}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
