import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import clsx from "clsx";
import { MessageComposer } from "@/components/forms/message-composer";
import type { Database, Message } from "@/types/database";

type Conversation = {
  job: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    client_id: string;
  };
  messages: Message[];
};

async function fetchConversations(userId: string): Promise<Conversation[]> {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (!messages?.length) {
    return [];
  }

  const jobIds = Array.from(new Set(messages.map((message) => message.job_id)));
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, event_date, location, client_id")
    .in("id", jobIds);

  if (!jobs?.length) {
    return [];
  }

  const grouped = new Map<string, Message[]>();
  messages.forEach((message) => {
    if (!grouped.has(message.job_id)) {
      grouped.set(message.job_id, []);
    }

    grouped.get(message.job_id)?.push(message);
  });

  return jobs.map((job) => ({ job, messages: grouped.get(job.id) ?? [] }));
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/setup");
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const conversations = await fetchConversations(session.user.id);

  if (!conversations.length) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-600 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Messaging</h1>
        <p>
          No conversations yet. Applications and booking requests will create
          threads automatically.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Browse jobs
        </Link>
      </div>
    );
  }

  const selectedJobId =
    typeof searchParams.jobId === "string"
      ? searchParams.jobId
      : conversations[0].job.id;

  const activeConversation =
    conversations.find((conversation) => conversation.job.id === selectedJobId) ??
    conversations[0];

  const viewerId = session.user.id;
  const participantIds = new Set<string>();
  activeConversation.messages.forEach((message) => {
    if (message.sender_id !== viewerId) {
      participantIds.add(message.sender_id);
    }
    if (message.recipient_id !== viewerId) {
      participantIds.add(message.recipient_id);
    }
  });

  const counterpartId =
    viewerId === activeConversation.job.client_id
      ? participantIds.values().next().value ?? null
      : activeConversation.job.client_id;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Conversations
        </h2>
        <nav className="space-y-2 text-sm text-zinc-600">
          {conversations.map((conversation) => (
            <Link
              key={conversation.job.id}
              href={`/messages?jobId=${conversation.job.id}`}
              className={clsx(
                "flex flex-col gap-1 rounded-2xl border px-4 py-3 transition",
                conversation.job.id === activeConversation.job.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 hover:border-zinc-300 hover:text-zinc-900",
              )}
            >
              <span className="text-sm font-semibold">
                {conversation.job.title}
              </span>
              <span className="text-xs uppercase tracking-wide">
                {new Date(conversation.job.event_date).toLocaleDateString()} ·{" "}
                {conversation.job.location}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className="flex h-full flex-col gap-6">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            {activeConversation.job.title}
          </h1>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {new Date(activeConversation.job.event_date).toLocaleString()} ·{" "}
            {activeConversation.job.location}
          </p>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          {activeConversation.messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                "flex flex-col gap-1 rounded-2xl px-4 py-3 text-sm",
                message.sender_id === viewerId
                  ? "self-end bg-zinc-900 text-white"
                  : "self-start border border-zinc-200 bg-zinc-50 text-zinc-700",
              )}
            >
              <p>{message.content}</p>
              <span className="text-[10px] uppercase tracking-wide">
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <MessageComposer
          jobId={activeConversation.job.id}
          recipientId={counterpartId ?? null}
        />
        {!counterpartId && viewerId === activeConversation.job.client_id ? (
          <p className="text-xs text-zinc-500">
            Applicants need to reach out or apply before you can respond here.
          </p>
        ) : null}
      </section>
    </div>
  );
}
