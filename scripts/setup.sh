#!/usr/bin/env bash
set -euo pipefail

NAME=""
SCOPE=""
TITLE=""
NO_INSTALL=false
SKIP_GIT=false

usage() {
  cat <<EOF
Usage: ./scripts/setup.sh [options]

Renames the backend starter template to your project name across all files.
If options are not provided, you will be prompted interactively.

Options:
  --name <name>      Project name (e.g. tiktak-backend)
  --scope <scope>    NPM scope (defaults to --name, e.g. tiktak)
  --title <title>    Display title (defaults to --name, e.g. "Tiktak Backend")
  --no-install       Skip pnpm install
  --skip-git         Do not reset git history / create initial commit
  --help, -h         Show this help

Examples:
  ./scripts/setup.sh --name tiktak-backend --scope tiktak --title "Tiktak Backend" --skip-git
  ./scripts/setup.sh --name my-backend --scope my-org --title "My Backend API"
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2 ;;
    --scope) SCOPE="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    --no-install) NO_INSTALL=true; shift ;;
    --skip-git) SKIP_GIT=true; shift ;;
    --help|-h) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

if [[ -z "$NAME" ]]; then
  while true; do
    read -rp "Enter project name (e.g., my-backend): " input_name
    if [[ -z "$input_name" ]]; then
      echo "❌ Project name cannot be empty."
    elif [[ ! "$input_name" =~ ^[a-zA-Z][a-zA-Z0-9_-]*$ ]]; then
      echo "❌ Error: Project name must start with a letter and contain only letters, numbers, hyphens, and underscores."
    else
      NAME="$input_name"
      break
    fi
  done
fi

if [[ ! "$NAME" =~ ^[a-zA-Z][a-zA-Z0-9_-]*$ ]]; then
  echo "❌ Error: Project name must start with a letter and contain only letters, numbers, hyphens, and underscores."
  exit 1
fi

SCOPE="${SCOPE:-$NAME}"

if [[ -z "$TITLE" ]]; then
  TITLE=$(echo "$NAME" | perl -pe 's/[-_]+/ /g; s/\b(\w)/\u$1/g')
fi

echo "🔧 Setting up project: $NAME"
echo "📦 Package scope: @$SCOPE"
echo "🏷️  Display title: $TITLE"
echo ""

TARGET_DIR="$(cd "$(dirname "$0")/.." && pwd)"

EXCLUDES=(
  -not -path '*/.git/*'
  -not -path '*/node_modules/*'
  -not -path '*/.turbo/*'
  -not -path '*/dist/*'
  -not -path '*/build/*'
  -not -path '*/generated/*'
  -not -name 'pnpm-lock.yaml'
  -not -name 'openapi.json'
  -not -name '*.wasm'
)

# Step 1: Replace scoped package references
echo "📝 @tiktak/ -> @${SCOPE}/"
export PERL_SCOPE="$SCOPE"
find "$TARGET_DIR" "${EXCLUDES[@]}" -type f \
  -exec perl -pi -e 's|\@tiktak/|\@$ENV{PERL_SCOPE}/|g' {} +

# Step 2: Replace lowercase name
echo "📝 tiktak-backend -> ${NAME}"
export PERL_NAME="$NAME"
find "$TARGET_DIR" "${EXCLUDES[@]}" -type f \
  -exec perl -pi -e 's/tiktak-backend/$ENV{PERL_NAME}/g' {} +
find "$TARGET_DIR" "${EXCLUDES[@]}" -type f \
  -exec perl -pi -e 's/tiktak-backend/$ENV{PERL_NAME}/g' {} +

# Step 3: Replace display title
echo "📝 Tiktak Backend -> ${TITLE}"
export PERL_TITLE="$TITLE"
find "$TARGET_DIR" "${EXCLUDES[@]}" -type f \
  -exec perl -pi -e 's/Tiktak Backend/$ENV{PERL_TITLE}/g' {} +
find "$TARGET_DIR" "${EXCLUDES[@]}" -type f \
  -exec perl -pi -e 's/Tiktak Backend/$ENV{PERL_TITLE}/g' {} +

# Step 4: Reset git (only for fresh template clones)
if [[ "$SKIP_GIT" == true ]]; then
  echo "⏭️  Skipping git reset (--skip-git)"
else
  echo "🗑️  Resetting git history..."
  rm -rf "$TARGET_DIR/.git"
  cd "$TARGET_DIR"
  git init -b main
fi

# Step 5: Install dependencies & generate DB client
if [[ "$NO_INSTALL" == false ]]; then
  echo "📦 Installing dependencies..."
  cd "$TARGET_DIR"
  pnpm install
  echo "⚙️ Generating Prisma & Kysely types..."
  pnpm --dir packages/database run db:generate || true
fi

if [[ "$SKIP_GIT" == false ]]; then
  cd "$TARGET_DIR"
  git add .
  git commit -m "Initial commit"
fi

echo ""
echo "✅ Project '${NAME}' is ready!"
