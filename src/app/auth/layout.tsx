export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
      {children}
    </div>
  );
}
