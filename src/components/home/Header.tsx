export const Header = () => (
  <header className="flex flex-col items-center text-center fade-in-up">
    <div className="mb-6 bg-primary/80 rounded-xl px-5 py-2.5">
      <img
        src="/schule.png"
        alt="Ernst-Schering-Schule"
        className="h-12 md:h-14"
      />
    </div>

    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-800 leading-tight mb-3">
      TikTok <span className="text-primary">FaktenCheck</span>
    </h1>

    <p className="font-body text-base text-muted-foreground max-w-sm leading-relaxed">
      Stimmt das wirklich, was du auf TikTok gesehen hast? Finde es hier heraus.
    </p>
  </header>
);
