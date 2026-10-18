# Base de datos y editor de noticias

El editor usa Supabase Auth y PostgreSQL con Row Level Security (RLS).

## Activación

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor** y ejecutar `supabase/migrations/202610180001_news_editor.sql`.
3. En **Authentication > Users**, crear el usuario editor.
4. En **SQL Editor**, asignarle un perfil (reemplazar el UUID):

```sql
insert into public.profiles (id, full_name, role)
values ('UUID-DEL-USUARIO', 'Editor PLANdeC', 'admin');
```

5. Configurar estas variables en Vercel y en `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

6. Volver a desplegar. El acceso queda disponible en `/login` y el editor en `/editor/noticias`.

La clave publicable puede estar en el navegador porque RLS controla las operaciones. No se debe usar ni publicar la `service_role`.
