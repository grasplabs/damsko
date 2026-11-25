import {
  Item,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemTitle,
} from "@grasp-os/ui/components/item";

// For the spec only (tests/item.spec.ts), at /examples/item/stack-sizes; not on the page. A list
// that stacks moves the detail under the name at every row size, not only `xs`.
export default function ItemStackSizes() {
  return (
    <ItemGroup aria-label="People" stack>
      <Item>
        <ItemContent>
          <ItemTitle>
            Amara Okafor
            <ItemDetail>Admin</ItemDetail>
          </ItemTitle>
        </ItemContent>
      </Item>
      <Item size="sm">
        <ItemContent>
          <ItemTitle>
            Jonas Weber
            <ItemDetail>Editor</ItemDetail>
          </ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  );
}
