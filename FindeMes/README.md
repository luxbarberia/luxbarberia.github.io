# FindeMes

PWA mobile-first para registrar gastos e ingresos, controlar presupuestos, iniciar sesion y estimar el gasto mensual con logica local.

## Como correrla

```bash
node server.mjs
```

Luego abrir:

```text
http://127.0.0.1:4173
```

Si preferis otro puerto:

```bash
PORT=3000 node server.mjs
```

## Instalacion en celular

- Android: abrir la URL en Chrome y tocar "Instalar" o "Agregar a pantalla principal".
- iPhone: abrir en Safari, tocar compartir y elegir "Agregar a pantalla de inicio".

## Datos

La app guarda todo localmente en el navegador. Desde Configuracion se puede exportar backup JSON/CSV, importar JSON y resetear datos con confirmacion.

## Sincronizacion en la nube

FindeMes trae integrada una capa de Supabase. Para activarla:

1. Crear un proyecto en Supabase.
2. Ejecutar el SQL de `supabase-schema.sql`.
3. Copiar `Project URL` y `anon public key`.
4. Pegarlos en `src/cloud.js`, dentro de `CLOUD_CONFIG`.

Con eso, cada usuario inicia sesion con usuario/email y contrasena, y sus datos se guardan por cuenta.
