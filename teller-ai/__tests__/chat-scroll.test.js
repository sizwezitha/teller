import test from "node:test";
import assert from "node:assert/strict";

import { shouldAutoScroll } from "../lib/chat-scroll.js";

test("shouldAutoScroll only follows new prompt when auto-scroll is enabled and the view is already at the bottom", () => {
  assert.equal(
    shouldAutoScroll({ isAutoScrollEnabled: true, isAtBottom: true }),
    true,
  );

  assert.equal(
    shouldAutoScroll({ isAutoScrollEnabled: true, isAtBottom: false }),
    false,
  );

  assert.equal(
    shouldAutoScroll({ isAutoScrollEnabled: false, isAtBottom: true }),
    false,
  );
});
