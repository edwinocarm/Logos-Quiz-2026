interface HeaderProps {
  title?: string;
  book?: string;
  chapter?: string;
}

export default function Header({ title, book, chapter }: HeaderProps) {
  const displayText = (book && chapter) ? `${book} - അധ്യായം ${chapter}` : title;

  return (
    <h1 className="text-3xl font-bold text-center text-amber-700 mb-6 capitalize">
      {displayText}
    </h1>
  );
}