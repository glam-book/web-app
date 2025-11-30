export const CommentBox = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null;

  return (
    <div className="mt-2 px-3 py-2 bg-white/5 rounded-md border border-transparent/10 text-sm text-muted-foreground">
      {children}
    </div>
  );
};
