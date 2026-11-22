import { StackTrace } from "@grasp-os/ui/components/stack-trace";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Firefox and Safari write a stack without the error's line and with "@" for "at": the same
// frames, read the same way. With no children it draws its line, Copy and the frames.
const stack = `formatInvoice@https://app.example.com/assets/billing.js:42:31
InvoiceRow/<@https://app.example.com/assets/invoice-row.js:18:12
map@[native code]
render@https://app.example.com/assets/vendor.js:1:20481`;

export default function StackTraceBrowser() {
  return (
    <div {...stylex.props(layout.column)}>
      <StackTrace trace={stack} />
    </div>
  );
}
