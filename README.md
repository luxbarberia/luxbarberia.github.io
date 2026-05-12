# Lux 3.0

Demo web instalable para Lux Barberia.

## Probar localmente

Abrir la carpeta con un servidor estatico y entrar a `index.html`.

## Publicar en GitHub Pages

Esta version no requiere build. Se puede publicar la carpeta completa como sitio estatico:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `supabase-config.js`

## Sincronizacion con Supabase

1. Crear un proyecto gratis en Supabase.
2. Abrir el editor SQL y ejecutar `supabase-schema.sql`.
3. Copiar la Project URL y la anon public key.
4. Pegarlas en `supabase-config.js`.
5. Publicar de nuevo la carpeta `lux-3`.

Con Supabase conectado, los clientes y turnos se guardan en la nube compartida. Sin Supabase, la app sigue funcionando en modo local/demo.

Para envio automatico real por WhatsApp hace falta conectar WhatsApp Business API o un proveedor como Twilio/Meta. En esta demo se abre WhatsApp con el mensaje de recordatorio ya armado para enviarlo manualmente.
