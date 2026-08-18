#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_NAME="$(basename "$0")"
readonly PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly QA_PROFILE="qa"
readonly QA_CHANNEL="qa"
readonly QA_ENVIRONMENT="preview"

usage() {
  cat <<EOF
Usage: ./${SCRIPT_NAME} <command> [message]

Prepare, build, and update the Dailie Sky QA app on an iPhone.

Commands:
  prepare             Configure this clone for EAS Update and the QA channel
  build               Register an iPhone, then create a new internal QA build
  update [message]    Publish JS/assets to the installed QA build (default)
  status              Show Expo login, project, channel, and build information
  help                 Show this help

Recommended first-time flow:
  ./${SCRIPT_NAME} prepare
  ./${SCRIPT_NAME} build

After installing the build from the URL/QR code printed by EAS:
  ./${SCRIPT_NAME} update "Describe the QA change"

Native dependency or app-config changes require another 'build'. JavaScript,
TypeScript, styling, and bundled asset changes can normally use 'update'.
EOF
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

note() {
  printf '\n==> %s\n' "$*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Required command '$1' was not found."
}

confirm() {
  local prompt="$1"
  local answer

  if [[ ! -t 0 ]]; then
    die "This step needs an interactive SSH terminal. Reconnect with 'ssh -t ...'."
  fi

  read -r -p "${prompt} [y/N] " answer
  [[ "$answer" =~ ^[Yy]([Ee][Ss])?$ ]]
}

eas() {
  npx --yes eas-cli@latest "$@"
}

has_eas_project_id() {
  node -e '
    const config = require("./app.json");
    process.exit(config.expo?.extra?.eas?.projectId ? 0 : 1);
  ' >/dev/null 2>&1
}

has_qa_profile() {
  [[ -f eas.json ]] && node -e '
    const config = require("./eas.json");
    const qa = config.build?.qa;
    process.exit(
      qa?.distribution === "internal" && qa?.channel === "qa" ? 0 : 1
    );
  ' >/dev/null 2>&1
}

write_qa_profile() {
  node <<'NODE'
const fs = require('node:fs');

const path = 'eas.json';
let config = {};

if (fs.existsSync(path)) {
  try {
    config = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Error: ${path} is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

config.cli ??= {};
config.cli.version ??= '>= 16.0.0';
config.cli.appVersionSource ??= 'remote';
config.build ??= {};
config.build.qa = {
  ...(config.build.qa ?? {}),
  distribution: 'internal',
  channel: 'qa',
  environment: 'preview',
};
config.submit ??= {};

fs.writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
NODE
}

install_dependencies() {
  note "Installing locked npm dependencies"
  npm ci
}

check_login() {
  note "Checking Expo account"
  if ! eas whoami >/dev/null 2>&1; then
    [[ -t 0 ]] || die "Expo login is required; run this command in an interactive SSH terminal."
    eas login
  fi
  eas whoami
}

prepare() {
  install_dependencies
  check_login

  if ! has_eas_project_id; then
    note "Linking the project and configuring expo-updates"
    printf '%s\n' "EAS may ask you to choose or create an Expo project."
    eas update:configure
  else
    note "The clone is already linked to an EAS project"
  fi

  if ! has_qa_profile; then
    note "Adding the internal QA build profile to eas.json"
    write_qa_profile
  else
    note "The QA build profile is already configured"
  fi

  note "Running project checks"
  npm run typecheck
  npx expo-doctor

  printf '\nPreparation complete. Review and commit app.json, package files, and eas.json\n'
  printf 'before building so every future clone has the same configuration.\n'
}

ensure_prepared() {
  if ! has_eas_project_id || ! has_qa_profile; then
    note "EAS QA configuration is missing"
    confirm "Run the one-time preparation now?" || die "Run './${SCRIPT_NAME} prepare' first."
    prepare
  else
    install_dependencies
    check_login
  fi
}

build_qa() {
  ensure_prepared

  note "Registering the iPhone for internal distribution"
  printf '%s\n' \
    "EAS will display a URL. Open it on the iPhone and follow the registration prompts." \
    "Apple Developer membership and interactive Apple authentication may be required."
  eas device:create

  note "Creating the iOS QA build"
  printf '%s\n' \
    "This embeds the '${QA_CHANNEL}' update channel in a release-style internal build." \
    "When EAS finishes, open its install URL on the registered iPhone."
  eas build --platform ios --profile "${QA_PROFILE}"
}

publish_update() {
  local message="${1:-}"

  ensure_prepared

  if [[ -z "$message" ]]; then
    if [[ -t 0 ]]; then
      read -r -p "Short description of this QA update: " message
    fi
    [[ -n "$message" ]] || die "Supply an update message, for example: ./${SCRIPT_NAME} update \"Fix calendar layout\""
  fi

  note "Running project checks"
  npm run typecheck
  npx expo-doctor

  printf '\nTarget:      iOS QA builds only\n'
  printf 'Channel:     %s\n' "$QA_CHANNEL"
  printf 'Environment: %s\n' "$QA_ENVIRONMENT"
  printf 'Message:     %s\n' "$message"
  confirm "Publish this update?" || die "Update cancelled."

  note "Publishing the iOS QA update"
  eas update \
    --platform ios \
    --channel "$QA_CHANNEL" \
    --environment "$QA_ENVIRONMENT" \
    --message "$message"

  printf '\nUpdate published. Fully close and reopen the QA app up to twice so it\n'
  printf 'can download and then launch the new update.\n'
}

show_status() {
  install_dependencies
  check_login

  note "Resolved Expo configuration"
  npx expo config --type public

  if has_eas_project_id; then
    note "Recent QA updates"
    eas update:list --branch "$QA_CHANNEL" --limit 5 || true

    note "Recent iOS QA builds"
    eas build:list --platform ios --profile "$QA_PROFILE" --limit 5 || true
  else
    printf '\nThis clone has not been linked to an EAS project yet.\n'
  fi
}

main() {
  for arg in "${@}"; do
    case "${arg}" in
      -h|--help)
        usage
        exit 0
        ;;
    esac
  done

  require_command node
  require_command npm
  require_command git

  cd "$PROJECT_DIR"
  [[ -f package.json && -f app.json ]] || die "Run this script from the Dailie Sky repository."

  local command="${1:-update}"
  case "$command" in
    prepare)
      [[ $# -eq 1 ]] || die "'prepare' does not accept extra arguments."
      prepare
      ;;
    build)
      [[ $# -eq 1 ]] || die "'build' does not accept extra arguments."
      build_qa
      ;;
    update)
      [[ $# -le 2 ]] || die "Wrap a multi-word update message in quotes."
      publish_update "${2:-}"
      ;;
    status)
      [[ $# -eq 1 ]] || die "'status' does not accept extra arguments."
      show_status
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      printf "Unknown command: %s\n\n" "$command" >&2
      usage >&2
      exit 2
      ;;
  esac
}

main "$@"
