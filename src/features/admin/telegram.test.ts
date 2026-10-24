import { describe, expect, it } from "vitest";
import { telegramImage } from "../../../supabase/functions/_shared/telegram";
const message = { message_id: 12, chat: { id: 42, type: "private" }, from: { id: 42 },
  photo: [{ file_id: "small", width: 10, height: 10 }, { file_id: "large", width: 100, height: 100 }] };
describe("Telegram archive", () => {
  it("accepts the largest photo only from an authorized private sender", () => {
    expect(telegramImage({ message }, new Set(["42"]))).toMatchObject({ fileId: "large", sourceId: "telegram:42:12" });
    expect(telegramImage({ message }, new Set(["99"]))).toBeNull();
    expect(telegramImage({ message: { ...message, chat: { id: 42, type: "group" } } }, new Set(["42"]))).toBeNull();
  });
  it("accepts image documents but ignores text and oversize files", () => {
    const base = { ...message, photo: undefined };
    expect(telegramImage({ message: base }, new Set(["42"]))).toBeNull();
    expect(telegramImage({ message: { ...base, document: { file_id: "png", mime_type: "image/png" } } }, new Set(["42"]))).toMatchObject({ mime: "image/png" });
    expect(telegramImage({ message: { ...base, document: { file_id: "large", mime_type: "image/png", file_size: 11000000 } } }, new Set(["42"]))).toBeNull();
  });
});
