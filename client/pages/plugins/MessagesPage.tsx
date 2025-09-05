import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchThreads, sendMessage } from "@/controllers/messagesController";
import type { MessageThread } from "@/models/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchThreads().then((ts) => {
      setThreads(ts);
      setActiveId(ts[0]?.id ?? null);
    });
  }, []);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) || null,
    [threads, activeId],
  );

  const onSend = async () => {
    if (!active || !text.trim()) return;
    await sendMessage(active.id, text.trim());
    setText("");
    const ts = await fetchThreads();
    setThreads(ts);
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">{t("messages.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul
            className="space-y-1"
            role="listbox"
            aria-label={t("messages.title") || undefined}
          >
            {threads.map((th) => (
              <li key={th.id}>
                <button
                  className={`w-full text-left rounded-md p-2 hover:bg-accent ${activeId === th.id ? "bg-accent" : ""}`}
                  onClick={() => setActiveId(th.id)}
                  role="option"
                  aria-selected={activeId === th.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium line-clamp-1">
                      {th.subject}
                    </span>
                    {th.unreadCount ? (
                      <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 text-xs">
                        {th.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {th.messages[th.messages.length - 1]?.content}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 min-h-[420px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">
            {active?.subject ?? t("messages.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 flex-1">
          <div
            className="flex-1 space-y-3 overflow-auto pr-1"
            role="log"
            aria-live="polite"
          >
            {active?.messages.map((m) => (
              <div key={m.id} className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">
                  {m.author.name} • {new Date(m.timestamp).toLocaleString()}
                </div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("messages.newMessagePlaceholder")}
              aria-label={t("messages.newMessagePlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
            <Button onClick={onSend} disabled={!text.trim()}>
              {t("login.submit")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
