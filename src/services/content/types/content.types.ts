export type HomeContent = {
  hero: {
    tag: string;
    title: string;
    subtitle: string;
    authority: string;
    image: string;

    primaryButton: {
      label: string;
      href: string;
    };

    secondaryButton: {
      label: string;
      href: string;
    };
  };

  globalAnalysis: {
    eyebrow: string;
    title: string;
    description: string;
  };

  news: {
    eyebrow: string;
    title: string;
    description: string;
  };
};