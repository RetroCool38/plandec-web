import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { teamMock } from "@/services/mock/team";

type TeamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return teamMock.map((member) => ({
    slug: member.slug,
  }));
}

export default async function TeamMemberPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const member = teamMock.find((item) => item.slug === slug);

  if (!member) {
    notFound();
  }

  return (
    <Container className="py-16">
      <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="flex justify-center lg:justify-start">
            <img
              src={member.image}
              alt={member.name}
              className="h-40 w-40 rounded-full border-2 border-[#5A2D82] object-cover"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white">{member.name}</h1>
            <p className="mt-2 text-lg font-medium text-[#A970FF]">
              {member.role}
            </p>

            <p className="mt-6 max-w-4xl leading-8 text-white/75">
              {member.bio}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  LinkedIn
                </a>
              )}

              {member.github && (
                <a
                  href={member.github}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  GitHub
                </a>
              )}

              {member.portfolio && (
                <a
                  href={member.portfolio}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Portfolio
                </a>
              )}

              {member.x && (
                <a
                  href={member.x}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  X
                </a>
              )}

              {member.email && (
                <a
                  href={member.email}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Correo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {member.sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-white/10 bg-[#0B1020] p-8"
          >
            <h2 className="text-2xl font-semibold text-white">
              {section.title}
            </h2>

            {section.content && (
              <p className="mt-4 leading-8 text-white/75">{section.content}</p>
            )}

            {section.tags && (
              <div className="mt-5 flex flex-wrap gap-3">
                {section.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {section.list && (
              <ul className="mt-4 space-y-3 text-white/75">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#A970FF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </Container>
  );
}