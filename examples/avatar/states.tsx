import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@grasp-os/ui/components/avatar";

// One avatar in one state. The docs draw it once per state, at the small size so each fits its
// cell. An avatar has no hover, focus or press of its own: it names someone, it is not pressed.
export default function AvatarState({
  name = "Lars",
  src,
}: {
  name?: string;
  src?: string;
}) {
  return (
    <Avatar name={name} size="sm">
      <AvatarImage src={src} />
      <AvatarFallback />
    </Avatar>
  );
}
