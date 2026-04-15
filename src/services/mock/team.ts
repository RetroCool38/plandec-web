type TeamSection = {
  title: string;
  content?: string;
  tags?: string[];
  list?: string[];
};

type TeamMember = {
  slug: string;
  name: string;
  role: string;
  image: string;
  shortDescription: string;
  bio: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  x?: string;
  email?: string;
  sections: TeamSection[];
};

export const teamMock: TeamMember[] = [
  {
    slug: "wolfgang-meulenbeek",
    name: "Wolfgang Meulenbeek",
    role: "Estrategia Política",
    image: "/team/wolfgang.jpg",
    shortDescription:
      "Politólogo y estratega político con experiencia en campañas y entidades gubernamentales.",
    bio: "Perfil completo en construcción.",
    email: "#",
    sections: [
      {
        title: "Perfil profesional",
        content: "Perfil completo en construcción.",
      },
    ],
  },

  {
    slug: "lucy-garces",
    name: "Lucy Garcés",
    role: "Comunicación y Medios",
    image: "/team/lucy.jpg",
    shortDescription:
      "Periodista y estratega en comunicación pública con experiencia en medios y entidades gubernamentales.",
    bio: "Perfil completo en construcción.",
    email: "#",
    sections: [
      {
        title: "Perfil profesional",
        content: "Perfil completo en construcción.",
      },
    ],
  },

  {
    slug: "andres-arias",
    name: "Andrés Arias",
    role: "Diseñador UX/UI",
    image: "/team/andres.jpg",
    shortDescription:
      "Especialista en experiencia de usuario e interfaces digitales para proyectos políticos.",
    bio: "Diseñador UX/UI con enfoque estratégico.",
    github: "https://github.com/ANemocon",
    portfolio: "https://github.com/ANemocon",
    x: "https://x.com/andyprodesign",
    email: "#",
    sections: [
      {
        title: "Perfil profesional",
        content:
          "Andrés es diseñador industrial y UX/UI Designer con experiencia en productos digitales, experiencia de usuario, wireframes, prototipos, diseño visual y decisiones estratégicas de producto.",
      },
      {
        title: "Herramientas y metodologías",
        tags: [
          "Figma",
          "Adobe Suite",
          "Hotjar",
          "Adobe XD",
          "Miro",
          "Maze",
          "ChatGPT",
          "Gemini",
          "Cursor",
          "Google AI Studio",
          "Design Thinking",
          "Agile",
          "Design Systems",
          "Human Centered Design",
        ],
      },
      {
        title: "Soft skills",
        list: [
          "Trabajo colaborativo y enfoque interdisciplinario.",
          "Capacidad para iterar soluciones de diseño de manera eficiente.",
          "Comunicación clara con equipos y stakeholders.",
          "Transparencia, autonomía y orientación a resultados.",
          "Capacidad para traducir necesidades complejas en soluciones usables.",
        ],
      },
    ],
  },

  {
    slug: "manuel-j-paez",
    name: "Manuel J Páez",
    role: "Estrategia Digital y Tecnología",
    image: "/team/manuel.jpg",
    shortDescription:
      "Enfocado en soluciones digitales, automatización y desarrollo web aplicado a política.",
    bio: "Tecnología aplicada a estrategia política.",
    linkedin: "https://www.linkedin.com/in/manuel-j-paez-hoyos-58793a249/",
    github: "https://github.com/RetroCool38",
    x: "https://x.com/Manu_paezh",
    email: "mailto:manepaez@hotmail.com",
    sections: [
      {
        title: "Perfil profesional",
        content:
          "Manuel se enfoca en la integración de tecnología, estrategia digital y soluciones prácticas para fortalecer proyectos, marcas y procesos de comunicación.",
      },
      {
        title: "Áreas de aporte",
        tags: [
          "Estrategia digital",
          "Desarrollo web",
          "Automatización",
          "Herramientas digitales",
          "Optimización de procesos",
          "Presencia online",
          "Tecnología aplicada",
          "Soporte estratégico",
        ],
      },
      {
        title: "Fortalezas",
        list: [
          "Capacidad para convertir necesidades en soluciones prácticas.",
          "Interés constante en aprendizaje, innovación y mejora de procesos.",
          "Enfoque organizado y orientado a resultados.",
          "Integración de tecnología con objetivos estratégicos.",
          "Adaptabilidad para trabajar en proyectos en evolución.",
        ],
      },
    ],
  },
];