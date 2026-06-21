export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <main className="min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}