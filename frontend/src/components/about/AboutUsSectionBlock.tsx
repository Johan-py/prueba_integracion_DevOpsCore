type AboutUsSectionBlockProps = {
  accent: string
  paragraphs: readonly string[]
  title: string
}

export default function AboutUsSectionBlock({
  accent,
  paragraphs,
  title
}: AboutUsSectionBlockProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-3xl font-bold leading-tight text-stone-900">
        {title} <span className="text-amber-600">{accent}</span>
      </h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-base leading-7 text-stone-600">
          {paragraph}
        </p>
      ))}
    </section>
  )
}
