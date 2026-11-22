// The 404 page's body (site/pages/404.astro), in the system's own hand: Empty at page size with its
// "lost" picture, and two ways on. Search opens through its [data-site-search] hook
// (site/behaviour/search.ts), so this renders on the server only and never hydrates.
import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";

export default function NotFound({ components }: { components: string }) {
  return (
    <Empty size="lg">
      <EmptyHeader>
        <EmptyMedia illustration="lost" />
        <EmptyTitle>No page at this address</EmptyTitle>
        <EmptyDescription>
          The link may be old. Search, or start from the components.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="site-not-found-actions">
          <Button variant="default" type="button" data-site-search="">
            Search the docs
          </Button>
          <Button variant="outline" asChild>
            <a href={components}>See the components</a>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
