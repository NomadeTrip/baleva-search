# Guía de Despliegue - Baleva Search

Esta guía te ayudará a desplegar Baleva Search en Vercel de forma gratuita.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Cuenta de Vercel (gratis)
- API key de Google Gemini (gratis)

## 🔑 Paso 1: Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Haz clic en "Create API Key"
3. Selecciona "Create API key in new project"
4. Copia la API key (la necesitarás después)

## 📦 Paso 2: Preparar el Repositorio

1. **Clonar o crear repositorio en GitHub**

Si aún no tienes el código en GitHub:

```bash
cd baleva-search
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/baleva-search.git
git push -u origin main
```

2. **Verificar que todo esté listo**

```bash
# Instalar dependencias localmente
pnpm install

# Verificar que compila sin errores
pnpm build

# Limpiar
rm -rf dist
```

## 🚀 Paso 3: Desplegar en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`

5. **Configurar Variables de Entorno**
   - En la sección "Environment Variables", agrega:
     - **Name**: `VITE_FRONTEND_FORGE_API_KEY`
     - **Value**: Tu API key de Gemini
     - **Name**: `VITE_FRONTEND_FORGE_API_URL`
     - **Value**: `https://generativelanguage.googleapis.com`

6. Haz clic en "Deploy"

### Opción B: Desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Seguir las instrucciones interactivas
# Cuando te pida variables de entorno, ingresa:
# VITE_FRONTEND_FORGE_API_KEY = tu_api_key
# VITE_FRONTEND_FORGE_API_URL = https://generativelanguage.googleapis.com
```

## ✅ Verificar el Despliegue

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Verifica que el estado sea "Ready"
3. Haz clic en el link para abrir tu aplicación
4. Prueba la búsqueda con una foto o link

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a GitHub, Vercel automáticamente:
1. Detectará los cambios
2. Ejecutará `pnpm build`
3. Desplegará la nueva versión

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

## 🐛 Solución de Problemas

### Error: "Build failed"

1. Verifica que no hay errores de TypeScript:
```bash
pnpm check
```

2. Verifica que todas las dependencias están instaladas:
```bash
pnpm install
```

3. Limpia el cache de Vercel:
   - En Vercel Dashboard > Settings > Git > Redeploy

### Error: "API key no válida"

1. Verifica que tu API key sea correcta
2. Asegúrate de que Gemini API esté habilitada
3. Regenera la API key si es necesario

### La aplicación carga pero no funciona

1. Abre la consola del navegador (F12)
2. Verifica si hay errores
3. Revisa que las variables de entorno estén configuradas correctamente

## 📊 Monitoreo

En Vercel Dashboard puedes:
- Ver logs de despliegue
- Monitorear el rendimiento
- Ver analytics
- Configurar dominios personalizados

## 💰 Costos

**Baleva Search es completamente gratis:**
- ✅ Vercel: Gratis (hasta 100GB de bandwidth/mes)
- ✅ Gemini API: Gratis (hasta 15 solicitudes por minuto)
- ✅ GitHub: Gratis (repositorios públicos)

## 🎉 ¡Listo!

Tu aplicación Baleva Search está desplegada y funcionando. Comparte el link con amigos y familiares para que encuentren alternativas más económicas.

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la consola del navegador (F12)
3. Abre un issue en GitHub

---

**¡Felicidades por desplegar tu aplicación! 🎊**
