import { LOGO_BRANDS } from "./content";
import { Reveal } from "./Reveal";

// Logo wall under the hero (taste-skill §4.8): real brand marks (Simple Icons,
// white monochrome on dark), logo-only with no category labels.
export function LogoWall() {
  return (
    <section className="border-y border-border-subtle bg-surface/40">
      <Reveal className="mx-auto w-full max-w-6xl px-xl py-xxl md:px-xxl">
        <p className="text-center text-footnote text-text-tertiary">
          Live rates from the providers you already use
        </p>
        <ul className="mt-lg flex flex-wrap items-center justify-center gap-x-xxxl gap-y-lg">
          {LOGO_BRANDS.map((brand) => (
            <li key={brand.slug}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://cdn.simpleicons.org/${brand.slug}/ffffff`}
                alt={brand.name}
                width={92}
                height={28}
                loading="lazy"
                className="h-7 w-auto opacity-50 transition-opacity duration-standard ease-standard hover:opacity-90"
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
