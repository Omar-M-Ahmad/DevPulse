import { useTranslations } from 'next-intl';

export function FeaturesGrid(): React.JSX.Element {
  const t = useTranslations('landing');

  const features = [
    {
      index: '01',
      title: t('features.f1_title'),
      description: t('features.f1_desc'),
    },
    {
      index: '02',
      title: t('features.f2_title'),
      description: t('features.f2_desc'),
    },
    {
      index: '03',
      title: t('features.f3_title'),
      description: t('features.f3_desc'),
    },
    {
      index: '04',
      title: t('features.f4_title'),
      description: t('features.f4_desc'),
    },
  ];

  return (
    <section id="features" className="px-6 max-w-6xl mx-auto pb-24">
      {/* Section label */}
      <p className="font-mono text-xs text-text-muted tracking-widest uppercase mb-8">
        // {t('features_label')}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-default border border-border-default rounded-md overflow-hidden">
        {features.map((f) => (
          <div
            key={f.index}
            className="bg-bg-secondary p-6 hover:bg-bg-hover transition-colors"
          >
            <p className="font-mono text-xs text-text-disabled mb-4">
              [{f.index}]
            </p>
            <p className="font-mono text-sm text-text-primary font-semibold mb-2">
              {f.title}
            </p>
            <p className="font-sans text-xs text-text-muted leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
