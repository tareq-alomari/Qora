module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "/var/run/postgresql",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "qor3a",
      user: process.env.DB_USER || "tareq",
      password: process.env.DB_PASSWORD || "",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./src/database/migrations",
    },
    seeds: {
      directory: "./src/database/seeds",
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: "./src/database/migrations",
    },
  },
};
