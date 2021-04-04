import * as winston from "winston";

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: "logs/log.log",
    format: winston.format.json(),
  }),
];

switch (process.env.NODE_ENV) {
  case "development": {
    transports.push(
      new winston.transports.Console({ format: winston.format.cli() })
    );
    break;
  }
  case "production": {
    transports.push(
      new winston.transports.Console({ format: winston.format.json() })
    );
    break;
  }
}

export function createLogger(name: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    defaultMeta: {
      service: name,
    },
    transports,
  });
}
