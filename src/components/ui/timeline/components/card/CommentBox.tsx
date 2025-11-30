export const CommentBox = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null;

  return (
    <div className="px-2 py-1 rounded-md  text-sm text-foreground">
      {children}
    </div>
  );
};
