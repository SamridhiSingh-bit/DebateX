#!/bin/sh
set -eu

if [ "${USE_IN_MEMORY_DATABASE:-false}" = "true" ]; then
  spring_profiles="prod,memory"
else
  spring_profiles="prod"
fi

if [ "$spring_profiles" = "prod" ] && [ -n "${DATABASE_URL:-}" ] && [ -z "${SPRING_DATASOURCE_URL:-}" ]; then
  case "$DATABASE_URL" in
    postgres://*|postgresql://*)
      rest="${DATABASE_URL#*://}"
      credentials="${rest%%@*}"
      host_and_database="${rest#*@}"
      case "$credentials" in
        *:*) ;;
        *)
          echo "DATABASE_URL must include a username and password" >&2
          exit 1
          ;;
      esac
      export SPRING_DATASOURCE_USERNAME="${credentials%%:*}"
      export SPRING_DATASOURCE_PASSWORD="${credentials#*:}"
      export SPRING_DATASOURCE_URL="jdbc:postgresql://${host_and_database}"
      ;;
    jdbc:*)
      export SPRING_DATASOURCE_URL="$DATABASE_URL"
      ;;
    *)
      echo "DATABASE_URL must use postgres://, postgresql://, or jdbc: format" >&2
      exit 1
      ;;
  esac
fi

exec java -XX:MaxRAMPercentage=75 "-Dspring.profiles.active=${spring_profiles}" -jar /app/app.jar
