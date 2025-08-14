# JWT Token

To generate a random JWT secret key, you can use a tool like Node.js to create a random string. Here's a simple example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Place the resulted string in your `.env` file. 

```json
{
    "jwt-key": "echo JWT_SECRET=$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\") > .env"
}
```

```bash
npm run jwt-key
```