import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@grasp-os/ui/components/sidebar";
import { visuallyHidden } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "flex",
    width: "100%",
    height: 300,
    overflow: "hidden",
    borderRadius: radius.md,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  provider: { minHeight: 0, height: "100%" },
  bar: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    paddingBlock: space["2"],
    paddingInline: space["3"],
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  // The page's own mark at the row's end: a small dot in the primary ink.
  dot: {
    flexShrink: 0,
    width: `calc(${size.agentIndicatorDot} * 2)`,
    height: `calc(${size.agentIndicatorDot} * 2)`,
    marginInlineStart: "auto",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});

const chats = [
  { id: "terms", name: "Payment terms this spring", unread: true },
  { id: "week", name: "Plan for next week", unread: false },
  { id: "renewals", name: "Contracts up for renewal", unread: true },
  { id: "hiring", name: "Hiring in the new year", unread: false },
];

// Something there not seen yet (`unread`): the row's words in the semibold weight, over the
// quiet rows' regular one. The weight is only seen, so the page says "Unread" in words too, here
// with its own dot at the row's end.
export default function SidebarUnread() {
  return (
    <div {...stylex.props(layout.frame)}>
      <SidebarProvider style={layout.provider}>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        asChild
                        unread={chat.unread}
                        variant="quiet"
                      >
                        <a href={`#${chat.id}`}>
                          {chat.name}
                          {chat.unread ? (
                            <>
                              <span
                                aria-hidden="true"
                                {...stylex.props(layout.dot)}
                              />
                              <span {...stylex.props(visuallyHidden)}>
                                Unread
                              </span>
                            </>
                          ) : null}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header {...stylex.props(layout.bar)}>
            <SidebarTrigger />
            <h2 {...stylex.props(layout.title)}>Recent</h2>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
