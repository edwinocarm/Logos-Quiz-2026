interface HeaderProps {
  title?: string;
  book?: string;
  chapter?: string;
}

export default function Header({ title, book, chapter }: HeaderProps) {
  // If the page sends a book and chapter, display them beautifully.
  // If it only sends a title (like on your homepage), display that instead!
  const displayText = (book && chapter) ? `${book} - അധ്യായം ${chapter}` : title;

  return (
    <h1 className="text-3xl font-bold text-center text-amber-700 mb-6 capitalize">
      {displayText}
    </h1>
  );
}