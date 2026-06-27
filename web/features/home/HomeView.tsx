"use client";

import { useRouter } from "next/navigation";
import { TIME_FRAMES } from "@/lib/models";
import { formatDelta, formatPHP, formatRate, relativeTime } from "@/lib/format";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { StatBox } from "@/components/StatBox";
import { SectionHeader } from "@/components/SectionHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { Sparkline } from "@/components/Sparkline";
import { Skeleton } from "@/components/Skeleton";
import { BrandAvatar } from "@/components/BrandAvatar";
import { useHomeViewModel } from "@/features/home/useHomeViewModel";

export function HomeView() {
  const router = useRouter();
  const vm = useHomeViewModel();

  return (
    <div className="flex flex-col gap-xxl px-xl pb-xxxxl pt-xl md:px-xxl">
      <header className="flex items-center justify-between">
        <h1 className="text-title font-extrabold">WiseRate</h1>
        <div className="flex items-center gap-md">
          <span className="text-caption text-text-tertiary">
            {vm.rate ? `Updated ${relativeTime(vm.rate.timestamp)}` : "—"}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-caption font-bold">
            MS
          </div>
        </div>
      </header>

      {vm.isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <HeroCard vm={vm} onCompare={() => router.push("/compare")} />

          {vm.loading ? (
            <Skeleton className="h-[72px] w-full" />
          ) : (
            <div className="grid grid-cols-3 gap-md">
              <StatBox label="1 EUR" value={vm.rate ? `₱${formatRate(vm.rate.rate)}` : "—"} />
              <StatBox
                label="24h Change"
                value={vm.rate ? `${vm.rate.delta24h >= 0 ? "▲" : "▼"} ${formatDelta(vm.rate.delta24h)}` : "—"}
                tone={vm.rate && vm.rate.delta24h < 0 ? "error" : "success"}
              />
              <StatBox label="Providers" value="15+" />
            </div>
          )}

          <section>
            <SectionHeader title="Top Providers" subtitle="Best rates right now" />
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
              {vm.loading
                ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[150px] w-full" />)
                : vm.topQuotes.map((quote, i) => (
                    <ProviderCard
                      key={quote.providerID}
                      quote={quote}
                      rank={i + 1}
                      onClick={() => router.push("/compare")}
                    />
                  ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Rate Trend" subtitle="EUR / PHP" />
            <Card className="bg-surface-elevated">
              <div className="no-scrollbar mb-md flex gap-sm overflow-x-auto">
                {TIME_FRAMES.map((tf) => (
                  <Chip key={tf} label={tf} active={tf === vm.timeFrame} onClick={() => vm.setTimeFrame(tf)} />
                ))}
              </div>
              {vm.loading && vm.history.length === 0 ? (
                <Skeleton className="h-[120px] w-full" />
              ) : (
                <Sparkline data={vm.history} />
              )}
            </Card>
          </section>

          {vm.sponsoredOffer && (
            <section>
              <SectionHeader title="Offers" subtitle="Sponsored" />
              <a
                href={vm.sponsoredOffer.affiliateURL}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block rounded border border-border bg-surface-elevated p-lg transition-colors duration-quick ease-standard hover:bg-surface-hover"
              >
                <div className="flex items-center gap-md">
                  <BrandAvatar icon={vm.sponsoredOffer.providerIcon} color={vm.sponsoredOffer.brandColor} size={40} />
                  <div className="min-w-0">
                    <div className="truncate text-callout font-semibold">{vm.sponsoredOffer.headline}</div>
                    <div className="mt-xs line-clamp-2 text-footnote text-text-secondary">
                      {vm.sponsoredOffer.description}
                    </div>
                  </div>
                </div>
                <div className="mt-md text-footnote font-semibold text-primary-light">
                  {vm.sponsoredOffer.ctaText} →
                </div>
              </a>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function HeroCard({ vm, onCompare }: { vm: ReturnType<typeof useHomeViewModel>; onCompare: () => void }) {
  return (
    <Card gradient>
      <label className="text-caption font-medium text-text-secondary">You send</label>
      <div className="mt-sm flex items-center gap-sm">
        <span className="text-title2 font-bold">€</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={vm.amount}
          onChange={(e) => vm.setAmount(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-transparent text-title font-extrabold tabular-nums outline-none placeholder:text-text-tertiary"
          placeholder="0"
          aria-label="Amount to send in euros"
        />
      </div>

      <div className="my-lg rounded-sm border border-border bg-[rgba(0,0,0,0.25)] p-lg">
        <div className="text-caption text-text-secondary">Recipient gets</div>
        {vm.loading || !vm.bestQuote ? (
          <Skeleton className="mt-sm h-[34px] w-2/3 bg-[rgba(255,255,255,0.12)]" />
        ) : (
          <>
            <div className="mt-xs text-[32px] font-extrabold leading-none text-success tabular-nums">
              {formatPHP(vm.bestQuote.receiveAmount)}
            </div>
            <div className="mt-sm text-caption text-text-secondary">
              via <span className="font-semibold text-text-primary">{vm.bestQuote.providerName}</span>
            </div>
          </>
        )}
      </div>

      <Button onClick={onCompare}>⟷ Compare All Providers</Button>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="text-center">
      <div className="text-title3 font-bold">No quotes for this pair</div>
      <p className="mt-sm text-footnote text-text-secondary">
        We don&apos;t yet support EUR→XYZ. Try the EUR→PHP corridor.
      </p>
    </Card>
  );
}
