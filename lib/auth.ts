import { betterAuth } from "better-auth";
import {
	bearer,
	admin,
	multiSession,
	oneTap,
	oAuthProxy,
	oidcProvider,
} from "better-auth/plugins";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2/promise";
import { nextCookies } from "better-auth/next-js";


const libsql = new LibsqlDialect({
	url: process.env.TURSO_DATABASE_URL || "",
	authToken: process.env.TURSO_AUTH_TOKEN || "",
});

const mysql = process.env.USE_MYSQL
	? new MysqlDialect(createPool(process.env.MYSQL_DATABASE_URL || ""))
	: null;

const dialect = process.env.USE_MYSQL ? mysql : libsql;

if (!dialect) {
	throw new Error("No dialect found");
}

export const auth = betterAuth({
	appName: "Better Auth Demo",
	database: {
		dialect,
		type: "sqlite",
	},
	account: {
		accountLinking: {
			trustedProviders: ["google", "github", "demo-app"],
		},
	},
	socialProviders: {

		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		},
		google: {
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		}
	},
	plugins: [
		bearer(),
		admin(),
		multiSession(),
		oneTap(),
		oAuthProxy(),
		nextCookies(),
		oidcProvider({
			loginPage: "/sign-in",
		}),
	],
});