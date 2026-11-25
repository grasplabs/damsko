import { Markdown } from "@grasp-os/ui/components/markdown";

const answer = `The roots of $$ax^2 + bx + c = 0$$ are

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

so for $$a = 1$$, $$b = -3$$ and $$c = 2$$ they are 1 and 2. A price such as $5 stays a price.`;

// Maths between two dollars: in a sentence, and on lines of its own.
export default function MarkdownMath() {
  return <Markdown>{answer}</Markdown>;
}
