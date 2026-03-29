import AboutUsImage from '@/components/about/AboutUsImage'
import AboutUsSectionBlock from '@/components/about/AboutUsSectionBlock'
import {
  aboutImages,
  introSections,
  peopleSection,
  presenceSections
} from '@/components/about/about.constants'

function AboutUsHeader() {
  return (
    <header className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-amber-600">
        Sobre Nosotros
      </p>
      <h1 className="font-heading text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
        QUIENES SOMOS
      </h1>
    </header>
  )
}

function AboutUsIntroCard() {
  return (
    <article className="grid gap-6 rounded-[28px] bg-stone-100 p-4 sm:p-6 lg:grid-cols-[1.05fr_1fr] lg:p-8">
      <AboutUsImage
        src={aboutImages.familyHome}
        alt="Propiedad residencial destacada de PropBol"
        className="h-72 w-full rounded-[24px] object-cover shadow-sm sm:h-80 lg:h-full"
      />
      <div className="space-y-8">
        {introSections.map((section) => (
          <AboutUsSectionBlock key={section.title} {...section} />
        ))}
      </div>
    </article>
  )
}

function AboutUsPeopleCard() {
  return (
    <article className="rounded-[28px] bg-stone-100 p-4 sm:p-6">
      <div className="space-y-4">
        <h2 className="font-heading max-w-xs text-3xl font-bold leading-tight text-stone-900">
          {peopleSection.title} <span className="text-amber-600">{peopleSection.accent}</span>
        </h2>
        <AboutUsImage
          src={peopleSection.imageSrc}
          alt={peopleSection.imageAlt}
          className="h-56 w-full rounded-[24px] object-cover shadow-sm"
        />
        <p className="text-base leading-7 text-stone-600">{peopleSection.description}</p>
      </div>
    </article>
  )
}

function AboutUsPresenceCard() {
  return (
    <article className="rounded-[28px] bg-stone-100 p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.76fr] lg:items-end">
        <div className="space-y-6">
          {presenceSections.map((section) => (
            <AboutUsSectionBlock key={section.title} {...section} />
          ))}
        </div>
        <AboutUsImage
          src={aboutImages.boliviaCity}
          alt="Vista urbana representativa del mercado inmobiliario boliviano"
          className="h-64 w-full rounded-[24px] object-cover shadow-sm sm:h-72 lg:h-80"
        />
      </div>
    </article>
  )
}

export default function AboutUsContent() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 py-4 font-['Inter'] sm:px-2 lg:gap-8">
      <AboutUsHeader />
      <AboutUsIntroCard />
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <AboutUsPeopleCard />
        <AboutUsPresenceCard />
      </div>
    </section>
  )
}
