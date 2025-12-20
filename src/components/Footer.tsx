export const Footer = () => {
  return (
    <footer className="relative py-12 px-4 border-t border-border/30">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gradient font-bold text-2xl mb-2">Labxat</p>
        <p className="text-muted-foreground text-sm">
          Um laboratório criativo digital
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-8 h-1 rounded-full bg-labxat-blue/50" />
          <div className="w-8 h-1 rounded-full bg-labxat-purple/50" />
          <div className="w-8 h-1 rounded-full bg-labxat-pink/50" />
        </div>
      </div>
    </footer>
  );
};
