# Database Setup Instructions

This application uses PostgreSQL (Neon) database with Prisma ORM.

## Initial Setup

1. **Environment Variables**
   The `.env` file contains the database connection string. It's already configured for the Neon PostgreSQL database.

2. **Push Schema to Database**
   ```bash
   npm run db:push
   ```
   This will create all the necessary tables in the database.

3. **Seed the Database**
   ```bash
   npm run db:seed
   ```
   This will create:
   - Admin user (username: `admin`, password: `PGVlasta` by default)
   - Sample video
   - Sample article
   
   **Security Note**: To use a custom admin password, set the `ADMIN_PASSWORD` environment variable before seeding:
   ```bash
   ADMIN_PASSWORD="your-secure-password" npm run db:seed
   ```

## Database Schema

The database contains 4 models:

### Admin
- `id`: Auto-increment ID
- `username`: Unique username
- `password`: Hashed password (using bcrypt)
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### Video
- `id`: Auto-increment ID
- `title`: Video title
- `url`: YouTube URL
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### Article
- `id`: Auto-increment ID
- `title`: Article title
- `content`: Full article content
- `excerpt`: Short description (optional)
- `imageUrl`: Article image URL (optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### Message
- `id`: Auto-increment ID
- `name`: Visitor name
- `message`: Message content
- `createdAt`: Creation timestamp

## Admin Access

After seeding, you can login to the admin panel:
- URL: `/admin`
- Username: `admin`
- Password: `PGVlasta`

From the admin dashboard you can:
- Manage videos
- Manage articles
- Manage messages

## Useful Commands

```bash
# View database in browser (Prisma Studio)
npm run db:studio

# Push schema changes to database
npm run db:push

# Re-seed database
npm run db:seed
```

## Database Location

The database is hosted on Neon (PostgreSQL):
- Host: `ep-jolly-rain-agyol052-pooler.c-2.eu-central-1.aws.neon.tech`
- Database: `neondb`

**Note**: The database credentials are stored in the `.env` file and should never be committed to git.
