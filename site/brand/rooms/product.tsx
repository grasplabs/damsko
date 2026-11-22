"use client";

// Room 11, the brand in the product: the product as people know it, drawn large and live. Three
// walls: the Sidebar beside a conversation whose Prompt input is working, on paper; the same screen at
// night; an agent asking before it acts.
import { productWords } from "../content";
import { Ask, ComponentsPickup, Screen } from "../exhibits-product";
import { Room, Wall } from "../frame";

export default function ProductRoom() {
  return (
    <Room id="product">
      <Wall
        room="product"
        first
        ground="light"
        exhibit={<Screen />}
        rule={productWords.screen}
        pickup={<ComponentsPickup />}
      />
      <Wall
        room="product"
        ground="night"
        exhibit={<Screen />}
        rule={productWords.night}
      />
      <Wall
        room="product"
        ground="light"
        exhibit={<Ask />}
        rule={productWords.asks}
      />
    </Room>
  );
}
