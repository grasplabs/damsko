import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

// Each block takes the direction of its own words (`dir="auto"`): a paragraph, heading, list item,
// quote or table cell in Arabic or Hebrew runs right to left, its list marker and quote bar on the
// right, beside blocks in English that run left to right. Code always runs left to right.
const answer = `The meeting notes, in the languages they were written in.

## ملخص الاجتماع

اتفق الفريق على موعد الإطلاق الجديد، وسيرسل التقرير قبل يوم الجمعة.

- مراجعة الميزانية
- تحديث الجدول الزمني
- Book the rooms for March

> הלקוח ביקש לקבל את הדוח בעברית.

| المدينة | Orders |
| :-- | --: |
| القاهرة | 120 |
| תל אביב | 85 |

\`\`\`ts
const city = "القاهرة";
\`\`\``;

// An answer's column, as wide as a chat's.
const layout = stylex.create({ column: { width: "100%", maxWidth: 704 } });

export default function MarkdownRightToLeft() {
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown>{answer}</Markdown>
    </div>
  );
}
