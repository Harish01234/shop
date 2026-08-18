# Commands

```powershell
npx @tanstack/cli@latest create .
```
Creates the TanStack Start app in this folder.

```powershell
npm run dev
```
Starts the app. Open http://localhost:3000

```powershell
npm audit
```
Checks packages for security issues. Does not fix anything.

```powershell
npx shadcn@latest init --preset b5Cpht6O48 --template start
```
Adds shadcn UI with the chosen design. (`--template start` is for a new Start app. This project already existed.)

```powershell
npx shadcn@latest init --preset b5Cpht6O48
```
Adds shadcn to an existing Start project. Safer for this folder next time.

```powershell
npx shadcn@latest add --all
```
Adds every shadcn component.

```powershell
npx shadcn@latest add --all -y
```
Same as above, skips the yes/no question.

```powershell
npx shadcn@latest add button card input dialog
```
Adds only the components you name.

```powershell
npx shadcn@latest add
```
Shows a list so you can pick components.

```powershell
npx shadcn@latest apply b5Cpht6O48
```
Applies the same design preset again.

```powershell
git add .
git commit -m "project initialization and shadcn setup done"
```
Saves all current files in git.

```powershell
npm run db:generate
```
Updates the Prisma client from the schema.

```powershell
npm run db:push
```
Pushes the schema to the database (no migration files).

```powershell
npm run db:migrate
```
Creates and runs a database migration.

```powershell
npm run db:studio
```
Opens a visual database editor.

```powershell
npm run db:seed
```
Runs the seed script.

```powershell
npx -y @better-auth/cli secret
```
Generates a secret for `BETTER_AUTH_SECRET`.

```powershell
npx -y @better-auth/cli generate
```
Creates Better Auth tables in Prisma.

```powershell
npm run format
```
Formats the code.

```powershell
npm run lint
```
Checks the code for problems.

```powershell
npm run build
```
Builds the app for production.

```powershell
npx dotenv -e .env.local -- prisma migrate status
```
Connects to the database and shows migration status. Use this to check if `DATABASE_URL` works. If Neon is asleep it can fail with `P1001` — open the Neon dashboard and run it again.

```powershell
npx prisma db pull
```
Does not work here. Prisma cannot see `.env.local`, so it says `DATABASE_URL` is missing.

```powershell
npx dotenv -e .env.local -- prisma db pull
```
Reads tables from the live database and writes them into `prisma/schema.prisma`. If the database is empty, it fails with `P4001`. Push your schema first with `npm run db:push`, then pull if you need to.
