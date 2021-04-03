import * as winston from "winston";

export function createLogger(name: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    defaultMeta: {
      service: name,
    },
    transports: [
      new winston.transports.Console({ format: winston.format.cli() }),
      new winston.transports.File({
        filename: "logs/log.log",
        format: winston.format.json(),
      }),
    ],
  });
}
