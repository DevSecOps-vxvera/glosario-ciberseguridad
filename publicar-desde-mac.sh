#!/usr/bin/env bash
# Asistente opcional para publicación inicial en GitHub Pages desde macOS.
set -euo pipefail
cd "$(dirname "$0")"

printf '\nGlosario de Ciberseguridad · Publicación inicial a GitHub Pages\n\n'
for command in git gh; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Falta %s. Instálalo con Homebrew y vuelve a ejecutar el script.\n' "$command" >&2
    exit 1
  fi
done
if [[ -d .git ]]; then
  printf 'Esta carpeta ya contiene un repositorio Git. Para actualizar, utiliza: git add . && git commit -m "Actualización" && git push\n' >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  printf 'Primero inicia sesión: gh auth login --web --git-protocol https\n' >&2
  exit 1
fi

read -r -p 'Nombre de repositorio [glosario-ciberseguridad-dpd]: ' repo_name
repo_name=${repo_name:-glosario-ciberseguridad-dpd}
if [[ ! "$repo_name" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  printf 'El nombre debe usar solamente letras, números, puntos, guiones y guiones bajos.\n' >&2
  exit 1
fi

printf '\nAVISO: el repositorio y el sitio serán PÚBLICOS. No deben contener datos personales reales.\n'
read -r -p '¿Deseas crear el repositorio público y subir estos archivos? [escribe SI]: ' confirmation
if [[ "$confirmation" != 'SI' ]]; then
  printf 'Operación cancelada. No se han publicado datos.\n'
  exit 0
fi

git init -b main
git add .
git commit -m 'Publicación inicial: glosario de ciberseguridad'
gh repo create "$repo_name" --public --source=. --remote=origin --push
printf '\nRepositorio creado. Activando GitHub Pages...\n'
if gh api --method POST 'repos/{owner}/{repo}/pages' \
  -f 'source[branch]=main' \
  -f 'source[path]=/' \
  --jq '.html_url'; then
  printf '\nListo. Puede tardar unos minutos en estar disponible públicamente.\n'
else
  printf '\nEl repositorio ya está creado, pero la activación automática de Pages falló.\n' >&2
  printf 'Usa Settings > Pages > Deploy from a branch > main > /(root).\n' >&2
  printf 'Puedes abrir tu repositorio con: gh repo view --web\n' >&2
fi
