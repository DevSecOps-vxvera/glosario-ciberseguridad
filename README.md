# Glosario técnico de ciberseguridad

Sitio estático y adaptable a móviles para el programa **Fundamentos, normativa y aplicación práctica de la ciberseguridad**, Módulo 1, **Víctor Vera**. Preparado para GitHub Pages y basado en el glosario ampliado de la presentación `Modulo1_Fundamentos_Ciberseguridad_ECOTEC_Victor_Vera.pptx`.

## Contenido

**Versión 2.0 (octubre 2026):** incorpora las definiciones del art. 4 y los principales conceptos operativos de la Ley Orgánica para el Fortalecimiento de la Ciberseguridad, publicada en el Quinto Suplemento del Registro Oficial N.º 290, el 22 de mayo de 2026. Distingue definiciones legales expresas de explicaciones pedagógicas y conserva referencias anteriores.

- **200 términos en 9 categorías**: 167 términos de la presentación fuente, más 33 conceptos de la Ley Orgánica para el Fortalecimiento de la Ciberseguridad (Ecuador, 2026).
- Cada tarjeta presenta: **término, explicación comprensible, ejemplo cotidiano, referencia documental y enlace para consultar la fuente**.
- Filtros por categoría, enfoque documental, búsqueda sin tildes, favoritos almacenados **solo en el navegador**, modo claro/oscuro y enlaces a términos individuales.
- Sin instalaciones, servicios externos, bases de datos, rastreadores ni API keys.
- Publicación desde la rama `main`, directorio raíz `/` con GitHub Pages.

### Carpetas y archivos

```text
glosario-ciberseguridad-victor-vera/
├── index.html                 # Portada, secciones y navegación
├── styles.css                 # Diseño responsivo
├── app.js                     # Tarjetas, filtros, búsqueda y favoritos
├── data/
│   └── glosario.json          # 200 conceptos y bibliografía
├── assets/
│   └── favicon.svg
├── .nojekyll                  # Evita procesamiento de Jekyll
├── .gitignore
├── publicar-desde-mac.sh      # Publicación inicial opcional y guiada
└── README.md
```

## Opción A — Publicar paso a paso desde la Terminal de tu Mac

> IMPORTANTE: el repositorio y la página se crearán **públicos**. GitHub Pages es un alojamiento para contenido público; no subas datos personales reales ni documentos internos.

### 1. Instalar las herramientas

Abre **Terminal** y comprueba si están instaladas:

```bash
git --version
brew --version
gh --version
```

Si ya tienes Homebrew, instala las herramientas que falten:

```bash
brew install git gh python
```

Si no tienes Homebrew, consulta primero la instalación oficial en https://brew.sh/. En macOS, las herramientas de línea de comando de Apple se pueden instalar con `xcode-select --install` si fuese necesario.

### 2. Autenticarse con GitHub

```bash
gh auth login --web --git-protocol https
gh auth setup-git
gh auth status
```

Completa la autenticación en el navegador. **No compartas tokens de acceso ni contraseñas**.

### 3. Descomprimir el sitio

Descarga el ZIP y sitúalo en `~/Downloads`. En Terminal:

```bash
cd ~/Downloads
unzip glosario-ciberseguridad-victor-vera.zip
cd glosario-ciberseguridad-victor-vera
ls -la
```

Si lo has descargado en otra carpeta, adapta la ruta.

### 4. Probar el sitio localmente

```bash
python3 -m http.server 8000
```

Abre **http://localhost:8000** y comprueba que aparezcan los 200 términos. Para detener el servidor presiona `Control + C`.

### 5. Crear un repositorio Git en la carpeta

```bash
git init -b main
git add .
git commit -m "Publicación inicial: glosario de ciberseguridad"
```

Si Git solicita identificar autor, configura tu nombre y correo de GitHub (sin copiar literalmente los ejemplos):

```bash
git config --global user.name "TU NOMBRE"
git config --global user.email "TU-CORREO-EN-GITHUB"
```

Después vuelve a ejecutar el `git commit`.

### 6. Crear el repositorio en GitHub y subir el contenido

```bash
gh repo create glosario-ciberseguridad-dpd --public --source=. --remote=origin --push
```

Este comando crea el repositorio público en tu cuenta y sube la rama `main`. Si quieres otro nombre, reemplaza `glosario-ciberseguridad-dpd`.

### 7. Activar GitHub Pages desde la Terminal

Ejecuta en la misma carpeta:

```bash
gh api --method POST 'repos/{owner}/{repo}/pages' \
  -f 'source[branch]=main' \
  -f 'source[path]=/' \
  --jq '.html_url'
```

GitHub puede tardar unos minutos en terminar la publicación. Para obtener la dirección confirmada por GitHub:

```bash
gh api 'repos/{owner}/{repo}/pages' --jq '.html_url'
```

La dirección **habitual** tendrá el formato:

```text
https://TU-USUARIO.github.io/glosario-ciberseguridad-dpd/
```

La URL anterior es un **ejemplo**, no una dirección creada automáticamente en tu nombre. No puedes conocer la URL efectiva hasta que GitHub confirme la activación.

**Alternativa si la API devuelve un error:** ejecuta `gh repo view --web`, abre **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch → main → /(root)** y presiona **Save**. Es la misma configuración, mediante navegador.

### 8. Actualizar el glosario en el futuro

Edita `data/glosario.json` respetando su estructura, o modifica los archivos HTML/CSS/JS. Después:

```bash
git add .
git commit -m "Actualización del glosario"
git push origin main
```

GitHub Pages publicará los cambios de la rama `main` automáticamente.

### 9. Comprobaciones de publicación

```bash
git status
git remote -v
gh api 'repos/{owner}/{repo}/pages' --jq '{url: .html_url, status: .status, branch: .source.branch}'
```

Si no aparece el sitio al instante, espera unos minutos y comprueba **Settings → Pages** y la pestaña **Actions** del repositorio.

## Opción B — Asistente automático (opcional)

Si prefieres ejecutar un solo script después de instalar `git` y `gh`, entrar en GitHub y descomprimir el ZIP:

```bash
cd ~/Downloads/glosario-ciberseguridad-victor-vera
bash publicar-desde-mac.sh
```

Antes de continuar el script te pide confirmación explícita para publicar el repositorio como **público**. Si ya publicaste el proyecto, usa los comandos de actualización de la sección 8, no el asistente inicial.

## Citas, fuentes y alcance

Los términos se copiaron **del contenido de la presentación proporcionada**, conservando la explicación didáctica, el ejemplo, la referencia y el número de diapositiva. Las fuentes disponibles en el sitio enlazan principalmente al repositorio de la Superintendencia de Protección de Datos Personales (SPDP), a la Guía de Gestión de Riesgos versión 2, a la Guía de Protección de Datos desde el Diseño y a referencias técnicas como NIST u OWASP.

La etiqueta «marco normativo» no significa que cada definición reproducida sea literal de una ley; el glosario está concebido como **material introductorio de formación**, no como dictamen legal o sustituto de verificar la versión vigente. Las normas y guías públicas pueden ser modificadas.

## Guía para cambiar el diseño

- Cambia la paleta en las variables CSS de `styles.css` (inicio del archivo).
- Cambia el título, la portada y la firma académica en `index.html`.
- Modifica categorías, ejemplos y referencias en `data/glosario.json`.
- Si añades un término, asígnale un `id` único, una categoría válida y el resto de campos del mismo formato, y actualiza el recuento `count` de la categoría.

---

**Autor del material académico:** Víctor Vera · Ecuador · Octubre de 2026.
